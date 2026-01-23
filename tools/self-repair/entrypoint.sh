#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
5tratumOS self-repair (runs on the target machine)

Usage:
  docker run --rm --privileged --pid=host --network host -v /:/host \
    ghcr.io/willitmod/5tratumos-self-repair:<tag> [--version vX.Y.Z]

Options:
  --version <tag>    Defaults to the image tag if set, else v0.3.122.
  --repo <owner/repo>  Defaults to WillItMod/5tratum.
  --asset <name>     Defaults to 5tratumos-update.tgz

Notes:
  - If /host/etc/5tratumos/update.token exists, it will be used to download private GitHub assets.
  - This container modifies the host filesystem under /host and restarts 5tratumOS services via nsenter.
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

repo="WillItMod/5tratum"
asset="5tratumos-update.tgz"
version="${IMAGE_TAG:-}"
if [ -z "${version}" ]; then
  version="v0.3.122"
fi

while [ $# -gt 0 ]; do
  case "$1" in
    --repo) repo="$2"; shift 2 ;;
    --asset) asset="$2"; shift 2 ;;
    --version) version="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

host_root="/host"
if [ ! -d "${host_root}" ]; then
  echo "Missing host mount at /host. Run with: -v /:/host" >&2
  exit 1
fi

detect_root() {
  local base="${host_root}/opt"
  local -a candidates=(
    "${base}/5tratumos"
    "${base}/5tratumOS"
    "${base}/forgeos"
    "${base}/ForgeOS"
  )

  local c
  for c in "${candidates[@]}"; do
    if [ -d "${c}" ]; then
      printf '%s' "${c}"
      return 0
    fi
  done

  # Heuristic search (handles unexpected casing/paths).
  # Look for a known file that exists in deployed installs.
  local found
  found="$(find "${base}" -maxdepth 5 -type f -path '*/overlay/nginx/default.conf' -print -quit 2>/dev/null || true)"
  if [ -n "${found}" ]; then
    # found: <root>/overlay/nginx/default.conf
    local p
    p="$(dirname "${found}")"  # .../overlay/nginx
    p="$(dirname "${p}")"      # .../overlay
    p="$(dirname "${p}")"      # <root>
    if [ -d "${p}" ]; then
      printf '%s' "${p}"
      return 0
    fi
  fi

  return 1
}

root=""
if ! root="$(detect_root)"; then
  echo "Unable to find 5tratumOS install root on host under ${host_root}/opt." >&2
  echo "Tried: ${host_root}/opt/5tratumos and common variants." >&2
  echo "If the install is elsewhere, create a symlink on the host to /opt/5tratumos and rerun." >&2
  exit 1
fi

lock_dir="${host_root}/run/5tratumos-self-repair.lock"
if mkdir "${lock_dir}" 2>/dev/null; then
  trap 'rmdir "${lock_dir}" 2>/dev/null || true' EXIT
else
  echo "Another self-repair appears to be running (lock: ${lock_dir})." >&2
  exit 1
fi

hostctl() {
  nsenter -t 1 -m -u -i -n -p -- "$@"
}

token_file="${host_root}/etc/5tratumos/update.token"
token=""
if [ -f "${token_file}" ]; then
  token="$(tr -d '\r\n' < "${token_file}" | sed -n '1p' || true)"
fi

base_url="https://github.com/${repo}/releases/download/${version}"
bundle_url="${base_url}/${asset}"
sha_url="${bundle_url}.sha256"

work="/tmp/5tratumos-self-repair"
rm -rf "${work}"
mkdir -p "${work}"

curl_args=(-fsSL)
if [ -n "${token}" ]; then
  curl_args+=(-H "Authorization: token ${token}")
fi

api_headers=(-H "Accept: application/vnd.github+json")
if [ -n "${token}" ]; then
  api_headers+=(-H "Authorization: token ${token}")
fi

download_release_asset() {
  local url="$1"
  local out="$2"
  local name="$3"

  # Fast path: public repo (or GitHub accepting auth on github.com download URLs).
  if curl "${curl_args[@]}" -o "${out}" "${url}" 2>/dev/null; then
    return 0
  fi

  # If we don't have a token, there's nothing else we can do.
  if [ -z "${token}" ]; then
    echo "[self-repair] download failed (no token): ${url}" >&2
    return 1
  fi

  # Private releases often return 404 on the github.com download URL even with Authorization headers.
  # Use the GitHub API to resolve asset IDs and download via the assets endpoint.
  local release_json
  release_json="$(curl -fsSL "${api_headers[@]}" "https://api.github.com/repos/${repo}/releases/tags/${version}")"

  local asset_id
  asset_id="$(printf '%s' "${release_json}" | jq -r --arg n "${name}" '.assets[] | select(.name==$n) | .id' | head -n 1)"
  if [ -z "${asset_id}" ] || [ "${asset_id}" = "null" ]; then
    echo "[self-repair] could not find asset '${name}' for ${repo}@${version}" >&2
    printf '%s\n' "${release_json}" | jq -r '.assets[].name' | sed 's/^/[self-repair] available: /' >&2 || true
    return 1
  fi

  curl -fsSL -L \
    -H "Authorization: token ${token}" \
    -H "Accept: application/octet-stream" \
    -o "${out}" \
    "https://api.github.com/repos/${repo}/releases/assets/${asset_id}"
}

echo "[self-repair] downloading ${bundle_url}"
download_release_asset "${bundle_url}" "${work}/${asset}" "${asset}"

echo "[self-repair] downloading ${sha_url}"
download_release_asset "${sha_url}" "${work}/${asset}.sha256" "${asset}.sha256"

echo "[self-repair] verifying sha256"
expected="$(awk '{print $1}' "${work}/${asset}.sha256" | head -n 1)"
actual="$(sha256sum "${work}/${asset}" | awk '{print $1}')"
if [ -z "${expected}" ] || [ "${expected}" != "${actual}" ]; then
  echo "[self-repair] sha256 mismatch" >&2
  echo "expected: ${expected}" >&2
  echo "actual:   ${actual}" >&2
  exit 1
fi

echo "[self-repair] stopping services (best-effort)"
hostctl systemctl stop 5tratumos-overlay.service 5tratumosd.service >/dev/null 2>&1 || true

stage="${work}/stage"
mkdir -p "${stage}"
tar -xzf "${work}/${asset}" -C "${stage}"

ts="$(date -u +%Y%m%dT%H%M%SZ)"

echo "[self-repair] backing up host directories"
for d in overlay daemon console bootstrap apps-available; do
  if [ -d "${root}/${d}" ]; then
    cp -a "${root}/${d}" "${root}/${d}.bak-${ts}"
  fi
done

echo "[self-repair] applying bundle to host"
install -d -m 0755 "${root}"
rm -rf "${root}/overlay" "${root}/apps-available" "${root}/daemon" "${root}/console" "${root}/bootstrap"
cp -a "${stage}/overlay" "${root}/overlay"
cp -a "${stage}/daemon" "${root}/daemon"
if [ -d "${stage}/bootstrap" ]; then cp -a "${stage}/bootstrap" "${root}/bootstrap"; fi
if [ -d "${stage}/apps-available" ]; then cp -a "${stage}/apps-available" "${root}/apps-available"; fi
if [ -d "${stage}/console" ]; then cp -a "${stage}/console" "${root}/console"; fi

echo "[self-repair] installing systemd units (if present)"
if [ -d "${stage}/systemd" ]; then
  install -d -m 0755 "${host_root}/etc/systemd/system"
  for unit in 5tratumosd.service 5tratumos-overlay.service 5tratumos-firstboot.service 5tratumos-firstboot-update.service; do
    if [ -f "${stage}/systemd/${unit}" ]; then
      install -m 0644 "${stage}/systemd/${unit}" "${host_root}/etc/systemd/system/${unit}"
    fi
  done
fi

echo "[self-repair] daemon-reload + restart"
hostctl systemctl daemon-reload || true
hostctl systemctl start 5tratumosd.service 5tratumos-overlay.service || true
hostctl docker restart 5tratumos-overlay-portal-1 >/dev/null 2>&1 || true

echo "[self-repair] health"
hostctl ss -lntp | grep -E ':(80|443|9000)\\b' || true
hostctl curl -sSI http://127.0.0.1/ | head -n 5 || true

echo "[self-repair] done"
