#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"

BUNDLE_NAME="${BUNDLE_NAME:-5tratumos-update.tgz}"
SIGNING_KEY="${SIGNING_KEY:-}"

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

# Normalize CRLF line endings (Windows checkouts) so shebangs and systemd units work on Linux.
if command -v sed >/dev/null 2>&1; then
  find "${tmp}" -type f -name '*.sh' -exec sed -i 's/\r$//' {} + >/dev/null 2>&1 || true
  find "${tmp}" -type f -name '*.service' -exec sed -i 's/\r$//' {} + >/dev/null 2>&1 || true
fi

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
