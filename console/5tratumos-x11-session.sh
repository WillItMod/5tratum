#!/usr/bin/env bash
set -euo pipefail

URL="${TRATUMOS_CONSOLE_URL:-http://127.0.0.1/login.html}"

# Basic X11 kiosk session that is resilient in virtualized environments (Proxmox/noVNC/SPICE).
# Keep this minimal: avoid Chromium extensions or extra flags that can cause a blank window.
if command -v matchbox-window-manager >/dev/null 2>&1; then
  matchbox-window-manager -use_titlebar no >/dev/null 2>&1 &
fi

chromium_args=(
  "--app=${URL}"
  "--ozone-platform=x11"
  "--noerrdialogs"
  "--no-first-run"
  "--no-default-browser-check"
  "--disable-session-crashed-bubble"
  "--disable-infobars"
  "--disable-features=TranslateUI"
  "--disable-translate"
  "--autoplay-policy=no-user-gesture-required"
)

# Prefer software rendering for broad compatibility (especially in VMs).
chromium_args+=("--disable-gpu" "--use-gl=swiftshader")

exec /usr/bin/chromium "${chromium_args[@]}"

