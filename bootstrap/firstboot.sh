#!/usr/bin/env bash
set -euo pipefail

DONE_FILE="/etc/5tratumos/firstboot.done"

mkdir -p /etc/5tratumos

if [ ! -f /etc/5tratumos/console.json ]; then
  cat >/etc/5tratumos/console.json <<'EOF'
{"enabled":true,"prompted":false,"user":"forge"}
EOF
  chmod 600 /etc/5tratumos/console.json || true
fi

# Default: enable kiosk mode (fullscreen local console) on hardware.
# This is a no-op on headless systems because the service is gated by /dev/dri/card0.
if [ -e /dev/dri/card0 ] && [ -x /opt/5tratumos/console/install.sh ]; then
  /opt/5tratumos/console/install.sh || true
fi

if [ -x /opt/5tratumos/bootstrap/os-tune.sh ]; then
  /opt/5tratumos/bootstrap/os-tune.sh || true
fi

if [ -x /opt/5tratumos/bootstrap/growfs.sh ]; then
  /opt/5tratumos/bootstrap/growfs.sh || true
fi

date -u +"%Y-%m-%dT%H:%M:%SZ" >"${DONE_FILE}"
