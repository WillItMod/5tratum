#!/usr/bin/env bash
set -euo pipefail

die() {
  echo "error: $*" >&2
  exit 1
}

have() { command -v "$1" >/dev/null 2>&1; }

require_root() {
  if [ "${EUID:-$(id -u)}" -ne 0 ]; then
    die "run as root (try: sudo $0)"
  fi
}

require_root

INSTALL_REPO="${INSTALL_REPO:-WillItMod/5tratum}"
INSTALL_REF="${INSTALL_REF:-main}"
INSTALL_TAG="${INSTALL_TAG:-v0.8.7}"
BUNDLE_URL="${BUNDLE_URL:-}"
CHANNEL="${CHANNEL:-}"
UPDATE_PUBLIC_KEY_FILE="${UPDATE_PUBKEY_FILE:-${UPDATE_PUBLIC_KEY_FILE:-}}"

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
  if [ "${INSTALL_TAG}" != "latest" ]; then
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
    local api="$(release_api_url)"
    local json
    if json="$(curl -fsSL --retry 3 --retry-delay 2 "${curl_auth_args[@]}" -H "Accept: application/vnd.github+json" "${api}" 2>/dev/null)"; then
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

  if [ "${INSTALL_TAG}" != "latest" ]; then
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
  debian|raspbian|ubuntu) ;;
  *)
    echo "warn: ID=${ID:-unknown}; this script supports Debian, Ubuntu and Raspberry Pi OS" >&2
    ;;
esac

arch="$(uname -m 2>/dev/null || true)"
case "${arch}" in
  aarch64|arm64|x86_64|amd64) ;;
  *)
    echo "warn: arch=${arch:-unknown}; Docker+apps may not be available on this architecture" >&2
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
  openssl \
  cloud-guest-utils \
  tar \
  xkb-data

echo "[3/6] Installing Docker + Compose..."
if ! have docker; then
  # Prefer Debian packages for maximum compatibility on ARM SBC images.
  docker_pkgs=(docker.io)
  apt-cache show docker-cli >/dev/null 2>&1 && docker_pkgs+=(docker-cli)
  apt-cache show containerd >/dev/null 2>&1 && docker_pkgs+=(containerd)
  apt-get install -y --no-install-recommends "${docker_pkgs[@]}"
fi
if ! docker compose version >/dev/null 2>&1 && apt-cache show docker-compose-plugin >/dev/null 2>&1; then
  apt-get install -y --no-install-recommends docker-compose-plugin || true
fi
if ! docker compose version >/dev/null 2>&1 && apt-cache show docker-compose-v2 >/dev/null 2>&1; then
  apt-get install -y --no-install-recommends docker-compose-v2 || true
fi
if ! docker compose version >/dev/null 2>&1 && ! have docker-compose && apt-cache show docker-compose >/dev/null 2>&1; then
  apt-get install -y --no-install-recommends docker-compose || true
fi
have docker || die "docker command not available after install"
if ! docker compose version >/dev/null 2>&1 && ! have docker-compose; then
  die "Docker Compose not available after install"
fi
systemctl enable --now docker

echo "[4/6] Downloading 5tratumOS bundle..."
tmp="$(mktemp -d)"
cleanup() { rm -rf "${tmp}" >/dev/null 2>&1 || true; }
trap cleanup EXIT

bundle="${tmp}/5tratumos-update.tgz"
sha="${tmp}/5tratumos-update.tgz.sha256"

readarray -t urls < <(resolve_bundle_urls)
bundle_url="${urls[0]}"
sha_url="${urls[1]:-}"

if ! download "${bundle_url}" "${bundle}"; then
  # An explicit media payload must never silently turn into a different release.
  [ -z "${BUNDLE_URL}" ] || die "explicit bundle download failed: ${BUNDLE_URL}"
  # If release downloads are access-controlled, use the GitHub API "asset download" endpoint.
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
    [ "${INSTALL_TAG}" = "latest" ] || die "requested release bundle could not be downloaded"
    # last-resort fallback to raw dist/
    raw_bundle="https://raw.githubusercontent.com/${INSTALL_REPO}/${INSTALL_REF}/dist/5tratumos-update.tgz"
    raw_sha="https://raw.githubusercontent.com/${INSTALL_REPO}/${INSTALL_REF}/dist/5tratumos-update.tgz.sha256"
    download "${raw_bundle}" "${bundle}"
    sha_url="${raw_sha}"
  fi
fi

[ -n "${sha_url}" ] || die "bundle checksum URL is missing"
if [ "${sha_url}" != "file:${sha}" ]; then
  download "${sha_url}" "${sha}" || die "bundle checksum could not be downloaded"
fi
[ -s "${sha}" ] || die "bundle checksum is missing"
expected_sha="$(awk 'NR==1{print $1}' "${sha}")"
[[ "${expected_sha}" =~ ^[a-fA-F0-9]{64}$ ]] || die "invalid bundle checksum"
actual_sha="$(sha256sum "${bundle}" | awk '{print $1}')"
[ "${actual_sha}" = "$(printf '%s' "${expected_sha}" | tr '[:upper:]' '[:lower:]')" ] || die "bundle sha256 verification failed"

echo "[5/6] Installing 5tratumOS..."
stage="${tmp}/stage"
mkdir -p "${stage}"
tar -xzf "${bundle}" -C "${stage}"

metadata="$(python3 - "${stage}/bootstrap/build.json" "${INSTALL_TAG}" "${CHANNEL}" "${INSTALL_REPO}" <<'PY'
import json, re, sys
from datetime import datetime, timezone
from pathlib import Path
path = Path(sys.argv[1])
metadata = json.loads(path.read_text())
for field, requested, pattern in zip(("tag", "channel", "repo"), sys.argv[2:],
                                    (r"[A-Za-z0-9][A-Za-z0-9._+-]*", r"main|dev", r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+")):
    value = metadata.get(field)
    if not isinstance(value, str) or not re.fullmatch(pattern, value):
        raise SystemExit(f"invalid bundle {field}")
    if requested and not (field == "tag" and requested == "latest") and requested != value:
        raise SystemExit(f"requested {field} does not match downloaded bundle")
metadata["installed_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
path.write_text(json.dumps(metadata, sort_keys=True) + "\n")
print(metadata["tag"])
print(metadata["channel"])
PY
)" || die "bundle metadata verification failed"
readarray -t metadata_fields <<<"${metadata}"
INSTALL_TAG="${metadata_fields[0]}"
CHANNEL="${metadata_fields[1]}"
install -d -m 0755 /etc/5tratumos
if [ -n "${UPDATE_PUBLIC_KEY_FILE}" ]; then
  openssl pkey -pubin -in "${UPDATE_PUBLIC_KEY_FILE}" -noout >/dev/null || die "invalid update public key"
  key_destination="${FIVETRATUMOS_UPDATE_PUBKEY_FILE:-${TRATUMOS_UPDATE_PUBKEY_FILE:-/etc/5tratumos/update_signing.pub}}"
  if [ "${UPDATE_PUBLIC_KEY_FILE}" != "${key_destination}" ]; then
    install -m 0644 "${UPDATE_PUBLIC_KEY_FILE}" "${key_destination}"
  fi
fi

# Optional Local AI: preserve enforcement before replacing daemon files.
local_ai_current="/opt/5tratumos/daemon/local_ai_packaging.py"
local_ai_incoming="${stage}/daemon/local_ai_packaging.py"
if [ -f "${local_ai_current}" ]; then
  python3 "${local_ai_current}" guard --tree "${stage}"
elif [ -f /etc/5tratumos/local-ai.json ] && [ ! -f "${local_ai_incoming}" ]; then
  die "Local AI ownership cannot be checked by this payload; preserve the installed daemon"
fi
if [ -f "${local_ai_incoming}" ]; then
  python3 "${local_ai_incoming}" prepare --tree "${stage}" \
    --public-key "${FIVETRATUMOS_UPDATE_PUBKEY_FILE:-${TRATUMOS_UPDATE_PUBKEY_FILE:-/etc/5tratumos/update_signing.pub}}"
elif [ -d "${stage}/bootstrap/local-ai" ]; then
  die "Local AI metadata is missing its offline validation tooling"
fi

install -d -m 0755 /opt/5tratumos
python3 "${stage}/bootstrap/install-overlay.py" \
  --source "${stage}/overlay" --destination /opt/5tratumos/overlay
rm -rf /opt/5tratumos/apps-available /opt/5tratumos/daemon /opt/5tratumos/console /opt/5tratumos/bootstrap || true

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
install -m 0644 "${stage}/bootstrap/build.json" /etc/5tratumos/build.json

if [ -n "${UPDATE_TOKEN}" ]; then
  install -d -m 0755 "$(dirname -- "${UPDATE_TOKEN_FILE}")"
  printf '%s\n' "${UPDATE_TOKEN}" >"${UPDATE_TOKEN_FILE}"
  chmod 600 "${UPDATE_TOKEN_FILE}" || true
fi

if [ -f "${stage}/bin/5tratumos" ]; then
  install -m 0755 "${stage}/bin/5tratumos" /usr/local/bin/5tratumos
fi
mux_updater_source="${stage}/bin/5tratmux-update"
if [ ! -f "${mux_updater_source}" ]; then
  mux_updater_source="${stage}/bootstrap/5tratmux-update"
fi
if [ -f "${mux_updater_source}" ]; then
  install -m 0755 "${mux_updater_source}" /usr/local/sbin/5tratmux-update
fi

install -m 0644 "${stage}/systemd/5tratumosd.service" /etc/systemd/system/5tratumosd.service
install -m 0644 "${stage}/systemd/5tratumos-overlay.service" /etc/systemd/system/5tratumos-overlay.service
install -m 0644 "${stage}/systemd/5tratumos-firstboot.service" /etc/systemd/system/5tratumos-firstboot.service
if [ -f "${stage}/systemd/5tratumos-firstboot-update.service" ]; then
  install -m 0644 "${stage}/systemd/5tratumos-firstboot-update.service" /etc/systemd/system/5tratumos-firstboot-update.service
fi
if [ -f "${stage}/systemd/5tratmux-bootstrap.service" ]; then
  install -m 0644 "${stage}/systemd/5tratmux-bootstrap.service" /etc/systemd/system/5tratmux-bootstrap.service
fi
if [ -f "${stage}/systemd/5tratmux-watchdog.service" ]; then
  install -m 0644 "${stage}/systemd/5tratmux-watchdog.service" /etc/systemd/system/5tratmux-watchdog.service
fi

systemctl daemon-reload || true
systemctl enable 5tratumosd.service 5tratumos-overlay.service 5tratumos-firstboot.service 5tratmux-bootstrap.service 5tratmux-watchdog.service || true
if [ -f /etc/systemd/system/5tratumos-firstboot-update.service ]; then
  systemctl enable 5tratumos-firstboot-update.service
fi
# Do not let the daemon or MUX client register before the durable per-install
# identity exists. A failure here is a real install failure, not a condition to
# paper over with an ephemeral identifier.
systemctl start 5tratumos-firstboot.service
systemctl restart 5tratumosd.service
systemctl start 5tratumos-overlay.service
systemctl start 5tratmux-bootstrap.service || true
systemctl start 5tratmux-watchdog.service || true

echo "[6/6] Done."
echo "UI: http://<device-ip>/"
echo "Installed bundle: ${INSTALL_TAG} (${CHANNEL})"
