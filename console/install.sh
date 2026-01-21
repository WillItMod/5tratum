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

CONSOLE_USER="${FIVETRATUMOS_CONSOLE_USER:-${TRATUMOS_CONSOLE_USER:-forge}}"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y

pkg_available() {
  apt-cache show "$1" 2>/dev/null | grep -qE '^Package: ' || return 1
  return 0
}

pick_one() {
  for p in "$@"; do
    if pkg_available "${p}"; then
      echo "${p}"
      return 0
    fi
  done
  return 1
}

pkgs=(
  cage
  curl
  kbd
  matchbox-window-manager
  x11-xserver-utils
  xinit
  xserver-xorg-core
)

chromium_pkg="$(pick_one chromium chromium-browser || true)"
if [ -z "${chromium_pkg}" ]; then
  die "chromium package not available (expected chromium or chromium-browser)"
fi
pkgs+=("${chromium_pkg}")

# Optional Xorg drivers (may be arch-specific).
for opt in xserver-xorg-video-fbdev xserver-xorg-video-vesa xserver-xorg-video-qxl; do
  if pkg_available "${opt}"; then
    pkgs+=("${opt}")
  fi
done

apt-get install -y --no-install-recommends "${pkgs[@]}"

if ! id -u "${CONSOLE_USER}" >/dev/null 2>&1; then
  useradd -m -s /bin/bash "${CONSOLE_USER}"
fi

for grp in video input render; do
  if getent group "${grp}" >/dev/null 2>&1; then
    usermod -aG "${grp}" "${CONSOLE_USER}" || true
  fi
done

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

install -m 0755 "${SCRIPT_DIR}/5tratumos-console.sh" /usr/local/bin/5tratumos-console
install -d -m 0755 /usr/local/lib/5tratumos
install -m 0755 "${SCRIPT_DIR}/5tratumos-x11-session.sh" /usr/local/lib/5tratumos/5tratumos-x11-session
install -m 0644 "${SCRIPT_DIR}/5tratumos-console@.service" /etc/systemd/system/5tratumos-console@.service

systemctl daemon-reload
systemctl enable --now "5tratumos-console@${CONSOLE_USER}.service"

echo "5tratumOS Console enabled for user: ${CONSOLE_USER}"
echo "If you don't see a display, ensure the machine has a DRM GPU (/dev/dri/card0)."
