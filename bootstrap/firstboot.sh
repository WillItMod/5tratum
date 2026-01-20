#!/usr/bin/env bash
set -euo pipefail

DONE_FILE="/etc/5tratumos/firstboot.done"

mkdir -p /etc/5tratumos

if [ ! -s /etc/machine-id ]; then
  if command -v systemd-machine-id-setup >/dev/null 2>&1; then
    systemd-machine-id-setup >/dev/null 2>&1 || true
  fi
fi

if command -v ssh-keygen >/dev/null 2>&1; then
  if ! ls /etc/ssh/ssh_host_* >/dev/null 2>&1; then
    ssh-keygen -A >/dev/null 2>&1 || true
  fi
fi

if [ ! -f /etc/5tratumos/console.json ]; then
  cat >/etc/5tratumos/console.json <<'EOF'
{"enabled":true,"prompted":false,"user":"forge"}
EOF
  chmod 600 /etc/5tratumos/console.json || true
fi

# Ensure console keymap/font setup is configured non-interactively so console-setup.service doesn't fail on boot.
# Default layout: UK (QWERTY). Debian XKB layout name is "gb" (not "uk").
if [ ! -f /etc/default/keyboard ]; then
  cat >/etc/default/keyboard <<'EOF'
# KEYBOARD CONFIGURATION FILE
XKBMODEL="pc105"
XKBLAYOUT="gb"
XKBVARIANT=""
XKBOPTIONS=""
BACKSPACE="guess"
EOF
fi

if [ ! -f /etc/default/console-setup ]; then
  cat >/etc/default/console-setup <<'EOF'
ACTIVE_CONSOLES="/dev/tty[1-6]"
CHARMAP="UTF-8"
CODESET="Lat15"
FONTFACE="Fixed"
FONTSIZE="16"
EOF
fi

if command -v setupcon >/dev/null 2>&1; then
  setupcon --force >/dev/null 2>&1 || true
fi
if command -v systemctl >/dev/null 2>&1; then
  systemctl restart console-setup.service >/dev/null 2>&1 || true
fi

# Default: enable kiosk mode (fullscreen local console) on hardware.
# This is a no-op on headless systems because the service is gated by /dev/dri/card0.
if [ -e /dev/dri/card0 ] && [ -f /opt/5tratumos/console/install.sh ]; then
  # Bundles built on Windows may land with CRLF and without exec bits; normalize so installs work.
  if command -v sed >/dev/null 2>&1; then
    sed -i 's/\r$//' /opt/5tratumos/console/*.sh >/dev/null 2>&1 || true
  fi
  chmod 0755 /opt/5tratumos/console/*.sh >/dev/null 2>&1 || true

  # Don't block boot/SSH while installing large UI packages (chromium/cage).
  if command -v systemd-run >/dev/null 2>&1; then
    systemd-run \
      --unit=5tratumos-console-install \
      --property=After=network-online.target \
      --property=Wants=network-online.target \
      /bin/bash /opt/5tratumos/console/install.sh >/dev/null 2>&1 || true
  else
    ( /bin/bash /opt/5tratumos/console/install.sh || true ) >/dev/null 2>&1 &
  fi
fi

if [ -x /opt/5tratumos/bootstrap/os-tune.sh ]; then
  /opt/5tratumos/bootstrap/os-tune.sh || true
fi

if [ -x /opt/5tratumos/bootstrap/growfs.sh ]; then
  /opt/5tratumos/bootstrap/growfs.sh || true
fi

date -u +"%Y-%m-%dT%H:%M:%SZ" >"${DONE_FILE}"
