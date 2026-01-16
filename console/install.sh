#!/usr/bin/env bash
set -euo pipefail

die() {
  echo "error: $*" >&2
  exit 1
}

have() { command -v "$1" >/dev/null 2>&1; }

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  die "run as root (try: sudo $0)"
fi

CONSOLE_USER="${FORGEOS_CONSOLE_USER:-forge}"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
  cage \
  chromium \
  curl

if ! id -u "${CONSOLE_USER}" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "${CONSOLE_USER}"
fi

for grp in video input render; do
  if getent group "${grp}" >/dev/null 2>&1; then
    usermod -aG "${grp}" "${CONSOLE_USER}" || true
  fi
done

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

install -m 0755 "${SCRIPT_DIR}/forgeos-console.sh" /usr/local/bin/forgeos-console
install -m 0644 "${SCRIPT_DIR}/forgeos-console@.service" /etc/systemd/system/forgeos-console@.service

systemctl daemon-reload
systemctl enable --now "forgeos-console@${CONSOLE_USER}.service"

echo "5tratumOS Console enabled for user: ${CONSOLE_USER}"
echo "If you don't see a display, ensure the machine has a DRM GPU (/dev/dri/card0)."
