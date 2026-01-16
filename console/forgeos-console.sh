#!/usr/bin/env bash
set -euo pipefail

URL="${FORGEOS_CONSOLE_URL:-http://127.0.0.1/}"
HEALTH_URL="${FORGEOS_CONSOLE_HEALTH_URL:-http://127.0.0.1/api/v0/health}"
WAIT_SECS="${FORGEOS_CONSOLE_WAIT_SECS:-90}"

if command -v curl >/dev/null 2>&1; then
  for _ in $(seq 1 "${WAIT_SECS}"); do
    if curl -fsS "${HEALTH_URL}" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
fi

export XDG_SESSION_TYPE=wayland
export MOZ_ENABLE_WAYLAND=1

exec /usr/bin/cage -- /usr/bin/chromium \
  --app="${URL}" \
  --enable-features=UseOzonePlatform \
  --ozone-platform=wayland \
  --no-first-run \
  --no-default-browser-check \
  --disable-session-crashed-bubble \
  --disable-infobars \
  --disable-features=TranslateUI \
  --disable-translate \
  --autoplay-policy=no-user-gesture-required

