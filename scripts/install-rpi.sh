#!/usr/bin/env bash
set -euo pipefail

die() {
  echo "error: $*" >&2
  exit 1
}

have() { command -v "$1" >/dev/null 2>&1; }

apt_has_pkg() {
  apt-cache show "$1" >/dev/null 2>&1
}

require_root() {
  if [ "${EUID:-$(id -u)}" -ne 0 ]; then
    die "run as root (try: sudo $0)"
  fi
}

require_root

INSTALL_REPO="${INSTALL_REPO:-WillItMod/5tratum}"
INSTALL_REF="${INSTALL_REF:-main}"
INSTALL_TAG="${INSTALL_TAG:-v0.5.00}"
BUNDLE_URL="${BUNDLE_URL:-}"
CHANNEL="${CHANNEL:-main}"

UPDATE_TOKEN="${UPDATE_TOKEN:-${GITHUB_TOKEN:-}}"
UPDATE_TOKEN_FILE="${UPDATE_TOKEN_FILE:-/etc/5tratumos/update.token}"

curl_auth_args=()
curl_follow_args=(-L)
if [ -n "${UPDATE_TOKEN}" ]; then
  curl_auth_args=(-H "Authorization: Bearer ${UPDATE_TOKEN}")
  # GitHub release downloads redirect to another host; keep Authorization across redirects.
  curl_follow_args=(--location-trusted)
fi

download() {
  local url="$1"
  local out="$2"
  curl -fsS "${curl_follow_args[@]}" --retry 3 --retry-delay 2 "${curl_auth_args[@]}" -o "${out}" "${url}"
}

release_api_url() {
  if [ -n "${INSTALL_TAG}" ] && [ "${INSTALL_TAG}" != "latest" ]; then
    echo "https://api.github.com/repos/${INSTALL_REPO}/releases/tags/${INSTALL_TAG}"
  else
    echo "https://api.github.com/repos/${INSTALL_REPO}/releases/latest"
  fi
}

download_github_asset_by_id() {
  local asset_id="$1"
  local out="$2"
  [ -n "${asset_id}" ] || return 1
  curl -fsS -L --retry 3 --retry-delay 2 \
    -H "Authorization: Bearer ${UPDATE_TOKEN}" \
    -H "Accept: application/octet-stream" \
    -H "User-Agent: 5tratumos" \
    -o "${out}" \
    "https://api.github.com/repos/${INSTALL_REPO}/releases/assets/${asset_id}"
}

resolve_bundle_urls() {
  if [ -n "${BUNDLE_URL}" ]; then
    echo "${BUNDLE_URL}"
    echo "${BUNDLE_URL}.sha256"
    return 0
  fi

  # Prefer GitHub release assets.
  if have jq; then
    local json
    if json="$(curl -fsSL --retry 3 --retry-delay 2 "${curl_auth_args[@]}" -H "Accept: application/vnd.github+json" "$(release_api_url)" 2>/dev/null)"; then
      local b
      local s
      b="$(printf '%s' "${json}" | jq -r '.assets[]? | select(.name=="5tratumos-update.tgz") | .browser_download_url' | head -n 1)"
      s="$(printf '%s' "${json}" | jq -r '.assets[]? | select(.name=="5tratumos-update.tgz.sha256") | .browser_download_url' | head -n 1)"
      if [ -n "${b}" ] && [ "${b}" != "null" ]; then
        echo "${b}"
        echo "${s:-}"
        return 0
      fi
    fi
  fi

  if [ -n "${INSTALL_TAG}" ] && [ "${INSTALL_TAG}" != "latest" ]; then
    echo "https://github.com/${INSTALL_REPO}/releases/download/${INSTALL_TAG}/5tratumos-update.tgz"
    echo "https://github.com/${INSTALL_REPO}/releases/download/${INSTALL_TAG}/5tratumos-update.tgz.sha256"
  else
    echo "https://github.com/${INSTALL_REPO}/releases/latest/download/5tratumos-update.tgz"
    echo "https://github.com/${INSTALL_REPO}/releases/latest/download/5tratumos-update.tgz.sha256"
  fi
  return 0
}

echo "[1/6] Checking OS/arch..."
if [ ! -f /etc/os-release ]; then
  die "/etc/os-release missing (unsupported OS)"
fi
. /etc/os-release
case "${ID:-}" in
  debian|raspbian) ;;
  *)
    echo "warn: ID=${ID:-unknown}; this script is intended for Debian/Raspbian-based Raspberry Pi images" >&2
    ;;
esac

arch="$(uname -m 2>/dev/null || true)"
case "${arch}" in
  aarch64|arm64) ;;
  *)
    echo "warn: arch=${arch:-unknown}; Docker/app images may not be available for this architecture" >&2
    ;;
esac

echo "[2/6] Installing base packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  jq \
  python3 \
  python3-yaml \
  tar \
  xkb-data

echo "[3/6] Installing Docker + Compose..."
if ! have docker; then
  # Prefer Debian/Raspberry Pi OS packages for maximum ARM SBC compatibility.
  docker_pkgs=(docker.io)
  apt_has_pkg docker-cli && docker_pkgs+=(docker-cli)
  apt_has_pkg containerd && docker_pkgs+=(containerd)
  apt-get install -y --no-install-recommends "${docker_pkgs[@]}"
fi
if ! have docker; then
  die "docker command not available after install"
fi
if ! docker compose version >/dev/null 2>&1 && apt_has_pkg docker-compose-plugin; then
  apt-get install -y --no-install-recommends docker-compose-plugin || true
fi
if ! docker compose version >/dev/null 2>&1 && ! have docker-compose && apt_has_pkg docker-compose; then
  apt-get install -y --no-install-recommends docker-compose || true
fi
if ! docker compose version >/dev/null 2>&1 && ! have docker-compose; then
  die "docker compose not available after install"
fi
systemctl enable --now docker >/dev/null 2>&1 || true

echo "[4/6] Downloading 5tratumOS bundle (${INSTALL_TAG:-latest})..."
tmp="$(mktemp -d)"
cleanup() { rm -rf "${tmp}" >/dev/null 2>&1 || true; }
trap cleanup EXIT

bundle="${tmp}/5tratumos-update.tgz"
sha="${tmp}/5tratumos-update.tgz.sha256"

readarray -t urls < <(resolve_bundle_urls)
bundle_url="${urls[0]}"
sha_url="${urls[1]:-}"

if ! download "${bundle_url}" "${bundle}"; then
  # If release downloads are access-controlled, use the GitHub API asset download endpoint.
  if [ -n "${UPDATE_TOKEN}" ] && have jq; then
    rel="$(curl -fsSL --retry 3 --retry-delay 2 \
      -H "Authorization: Bearer ${UPDATE_TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -H "User-Agent: 5tratumos" \
      "$(release_api_url)" 2>/dev/null || true)"
    asset_id="$(printf '%s' "${rel}" | jq -r '.assets[]? | select(.name=="5tratumos-update.tgz") | .id' | head -n 1)"
    sha_id="$(printf '%s' "${rel}" | jq -r '.assets[]? | select(.name=="5tratumos-update.tgz.sha256") | .id' | head -n 1)"
    if [ -n "${asset_id}" ] && [ "${asset_id}" != "null" ] && download_github_asset_by_id "${asset_id}" "${bundle}"; then
      sha_url=""
      if [ -n "${sha_id}" ] && [ "${sha_id}" != "null" ]; then
        download_github_asset_by_id "${sha_id}" "${sha}" || true
        sha_url="file:${sha}"
      fi
    fi
  fi

  if [ ! -f "${bundle}" ] || [ ! -s "${bundle}" ]; then
    raw_bundle="https://raw.githubusercontent.com/${INSTALL_REPO}/${INSTALL_REF}/dist/5tratumos-update.tgz"
    raw_sha="https://raw.githubusercontent.com/${INSTALL_REPO}/${INSTALL_REF}/dist/5tratumos-update.tgz.sha256"
    download "${raw_bundle}" "${bundle}"
    sha_url="${raw_sha}"
  fi
fi

if [ -n "${sha_url}" ]; then
  if [[ "${sha_url}" == file:* ]]; then
    sha_src="${sha_url#file:}"
    if [ -f "${sha_src}" ]; then
      cp -f "${sha_src}" "${sha}"
    fi
  elif download "${sha_url}" "${sha}"; then
    true
  fi
  if [ -f "${sha}" ] && have sha256sum; then
    (cd "${tmp}" && sha256sum -c "$(basename -- "${sha}")") || die "bundle sha256 verification failed"
  fi
fi

echo "[5/6] Installing 5tratumOS..."
stage="${tmp}/stage"
mkdir -p "${stage}"
tar -xzf "${bundle}" -C "${stage}"

install -d -m 0755 /opt/5tratumos
rm -rf /opt/5tratumos/overlay /opt/5tratumos/apps-available /opt/5tratumos/daemon /opt/5tratumos/console /opt/5tratumos/bootstrap || true

cp -a "${stage}/overlay" /opt/5tratumos/overlay
cp -a "${stage}/daemon" /opt/5tratumos/daemon
if [ -d "${stage}/bootstrap" ]; then
  cp -a "${stage}/bootstrap" /opt/5tratumos/bootstrap
fi
if [ -d "${stage}/apps-available" ]; then
  cp -a "${stage}/apps-available" /opt/5tratumos/apps-available
fi
if [ -d "${stage}/console" ]; then
  cp -a "${stage}/console" /opt/5tratumos/console
fi

install -d -m 0755 /var/lib/5tratumos/apps
install -d -m 0755 /etc/5tratumos
echo "${CHANNEL}" >/etc/5tratumos/channel

if [ -n "${UPDATE_TOKEN}" ]; then
  install -d -m 0755 "$(dirname -- "${UPDATE_TOKEN_FILE}")"
  printf '%s\n' "${UPDATE_TOKEN}" >"${UPDATE_TOKEN_FILE}"
  chmod 600 "${UPDATE_TOKEN_FILE}" || true
fi

if [ -f "${stage}/bin/5tratumos" ]; then
  install -m 0755 "${stage}/bin/5tratumos" /usr/local/bin/5tratumos
fi

for unit in 5tratumosd.service 5tratumos-overlay.service 5tratumos-firstboot.service 5tratumos-firstboot-update.service; do
  install -m 0644 "${stage}/systemd/${unit}" "/etc/systemd/system/${unit}"
done

systemctl daemon-reload || true
systemctl enable 5tratumosd.service 5tratumos-overlay.service 5tratumos-firstboot.service 5tratumos-firstboot-update.service || true
systemctl start 5tratumos-firstboot.service || true
systemctl restart 5tratumosd.service || true
systemctl restart 5tratumos-overlay.service || true

echo "[6/6] Done."
echo "UI: http://<device-ip>/"
echo "Channel: ${CHANNEL}"
echo "Installed bundle: ${INSTALL_TAG:-latest}"
