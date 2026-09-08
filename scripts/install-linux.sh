#!/usr/bin/env bash
set -euo pipefail

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "error: run as root (example: curl -fsSL <url> | sudo bash)" >&2
  exit 1
fi

tmp="$(mktemp)"
cleanup() { rm -f "${tmp}" >/dev/null 2>&1 || true; }
trap cleanup EXIT

export INSTALL_REPO="${INSTALL_REPO:-WillItMod/5tratum}"
export INSTALL_REF="${INSTALL_REF:-main}"
export CHANNEL="${CHANNEL:-main}"
export INSTALL_TAG="${INSTALL_TAG:-v0.8.7}"

curl -fsSL --retry 3 --retry-delay 2 \
  "https://raw.githubusercontent.com/${INSTALL_REPO}/${INSTALL_REF}/scripts/install-rpi.sh" \
  -o "${tmp}"

bash "${tmp}"
