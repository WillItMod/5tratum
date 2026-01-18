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
mkdir -p "${tmp}/overlay" "${tmp}/daemon" "${tmp}/systemd" "${tmp}/bin" "${tmp}/console"

cp -a "${ROOT_DIR}/overlay" "${tmp}/overlay/"
cp -a "${ROOT_DIR}/daemon" "${tmp}/daemon/"
cp -a "${ROOT_DIR}/systemd" "${tmp}/systemd/"
cp -a "${ROOT_DIR}/bin/5tratumos" "${tmp}/bin/5tratumos"
if [ -d "${ROOT_DIR}/console" ]; then
  cp -a "${ROOT_DIR}/console/." "${tmp}/console/"
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
  overlay daemon systemd bin console

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
