#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"

BUNDLE_NAME="${BUNDLE_NAME:-5tratumos-update.tgz}"
SIGNING_KEY="${SIGNING_KEY:-}"
BUILD_CHANNEL="${BUILD_CHANNEL:-main}"

mkdir -p "${DIST_DIR}"

tmp="$(mktemp -d)"
cleanup() { rm -rf "${tmp}"; }
trap cleanup EXIT

cd "${ROOT_DIR}"

# Stage only what the daemon update applier knows how to deploy.
mkdir -p "${tmp}/overlay" "${tmp}/daemon" "${tmp}/bootstrap" "${tmp}/apps-available" "${tmp}/systemd" "${tmp}/bin" "${tmp}/console"

cp -a "${ROOT_DIR}/overlay/." "${tmp}/overlay/"
cp -a "${ROOT_DIR}/daemon/." "${tmp}/daemon/"
cp -a "${ROOT_DIR}/bootstrap/." "${tmp}/bootstrap/"
cp -a "${ROOT_DIR}/apps-available/." "${tmp}/apps-available/"
cp -a "${ROOT_DIR}/systemd/." "${tmp}/systemd/"
cp -a "${ROOT_DIR}/bin/5tratumos" "${tmp}/bin/5tratumos"
if [ -d "${ROOT_DIR}/console" ]; then
  cp -a "${ROOT_DIR}/console/." "${tmp}/console/"
fi

# Embed build metadata inside the bundle so fresh installs can show a real version
# even if the installer fails to write /etc/5tratumos/build.json.
tag="$(git describe --tags --abbrev=0 2>/dev/null || true)"
if [ -z "${tag}" ]; then
  sha="$(git rev-parse --short HEAD 2>/dev/null || true)"
  tag="${sha:+rev-${sha}}"
fi
tag="${tag:-unknown}"
now="$(date -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "")"
printf '{"tag":"%s","repo":"WillItMod/5tratum","channel":"%s","built_at":"%s"}\n' \
  "${tag}" "${BUILD_CHANNEL}" "${now}" >"${tmp}/bootstrap/build.json"

# Windows filesystems do not preserve executable bits reliably. Normalize script perms
# in the staging dir so installs don't fail at first boot.
chmod 0755 "${tmp}/bin/5tratumos" >/dev/null 2>&1 || true
if [ -d "${tmp}/bootstrap" ]; then
  find "${tmp}/bootstrap" -type f -name '*.sh' -exec chmod 0755 {} + || true
fi
if [ -d "${tmp}/console" ]; then
  find "${tmp}/console" -type f -name '*.sh' -exec chmod 0755 {} + || true
fi

bundle_path="${DIST_DIR}/${BUNDLE_NAME}"
sha_path="${bundle_path}.sha256"
sig_path="${bundle_path}.sig"

# Deterministic tar where possible.
tar \
  --sort=name \
  --mtime='UTC 2020-01-01' \
  --owner=0 --group=0 --numeric-owner \
  -czf "${bundle_path}" \
  -C "${tmp}" \
  overlay daemon bootstrap apps-available systemd bin console

sha256sum "${bundle_path}" | sed "s|${bundle_path}|${BUNDLE_NAME}|" > "${sha_path}"

if [ -n "${SIGNING_KEY}" ]; then
  openssl pkeyutl -sign -inkey "${SIGNING_KEY}" -in "${bundle_path}" -out "${sig_path}"
fi

echo "Wrote:"
echo "  ${bundle_path}"
echo "  ${sha_path}"
if [ -f "${sig_path}" ]; then
  echo "  ${sig_path}"
fi
