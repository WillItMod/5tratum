#!/usr/bin/env bash
set -euo pipefail

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "error: run as root (example: curl -fsSL <url> | sudo bash)" >&2
  exit 1
fi

tmp="$(mktemp)"
cleanup() { rm -f "${tmp}" >/dev/null 2>&1 || true; }
trap cleanup EXIT

curl -fsSL --retry 3 --retry-delay 2 \
  https://raw.githubusercontent.com/WillItMod/5tratum/main/scripts/install-rpi.sh \
  -o "${tmp}"

export CHANNEL="${CHANNEL:-main}"
export INSTALL_TAG="${INSTALL_TAG:-latest}"
exec bash "${tmp}"
