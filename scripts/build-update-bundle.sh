#!/usr/bin/env bash
set -euo pipefail

die() {
  echo "error: $*" >&2
  exit 1
}

have() { command -v "$1" >/dev/null 2>&1; }

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

BUNDLE_NAME="${BUNDLE_NAME:-5tratumos-update.tgz}"
OUT_DIR="${OUT_DIR:-${ROOT}/dist}"
SIGNING_KEY="${SIGNING_KEY:-}"

usage() {
  cat <<EOF
build-update-bundle.sh: package a 5tratumOS update bundle for GitHub Releases

Usage:
  ./scripts/build-update-bundle.sh [--out <dir>] [--name <bundle.tgz>]

Env:
  OUT_DIR=<dir>        Output directory (default: ./dist)
  BUNDLE_NAME=<file>   Bundle filename (default: 5tratumos-update.tgz)
EOF
}

while [ $# -gt 0 ]; do
  case "${1}" in
    -h|--help)
      usage
      exit 0
      ;;
    --out)
      OUT_DIR="${2:-}"
      [ -n "${OUT_DIR}" ] || die "--out requires a value"
      shift 2
      ;;
    --name)
      BUNDLE_NAME="${2:-}"
      [ -n "${BUNDLE_NAME}" ] || die "--name requires a value"
      shift 2
      ;;
    *)
      die "unknown arg: ${1}"
      ;;
  esac
done

have tar || die "tar not found"
have sha256sum || die "sha256sum not found"

mkdir -p "${OUT_DIR}"

bundle_path="${OUT_DIR}/${BUNDLE_NAME}"
sha_path="${bundle_path}.sha256"
sig_path="${bundle_path}.sig"

echo "Packaging update bundle..."
echo "  root: ${ROOT}"
echo "  out:  ${bundle_path}"

rm -f "${bundle_path}" "${sha_path}"
rm -f "${sig_path}"

(
  cd "${ROOT}"
  tar -czf "${bundle_path}" \
    overlay \
    daemon \
    systemd \
    bin/5tratumos \
    apps-available \
    console
)

(
  cd "${OUT_DIR}"
  sha256sum "${BUNDLE_NAME}" >"$(basename "${sha_path}")"
)

if [ -n "${SIGNING_KEY}" ]; then
  if [ ! -f "${SIGNING_KEY}" ]; then
    die "SIGNING_KEY was set but file not found: ${SIGNING_KEY}"
  fi
  have openssl || die "openssl not found (required for signing)"
  echo "Signing update bundle..."
  # Ed25519 signature over the bundle file (binary).
  openssl pkeyutl -sign -inkey "${SIGNING_KEY}" -in "${bundle_path}" -out "${sig_path}"
fi

echo "Wrote:"
echo "  ${bundle_path}"
echo "  ${sha_path}"
if [ -f "${sig_path}" ]; then
  echo "  ${sig_path}"
fi
echo
echo "Next:"
echo "  - Create a GitHub Release in WillItMod/5tratum"
echo "  - Upload both files as release assets"
