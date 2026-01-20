#!/usr/bin/env bash
set -euo pipefail

URL="${TRATUMOS_CONSOLE_URL:-http://127.0.0.1/}"
HEALTH_URL="${TRATUMOS_CONSOLE_HEALTH_URL:-http://127.0.0.1/api/v0/auth/check}"
WAIT_SECS="${TRATUMOS_CONSOLE_WAIT_SECS:-90}"

read_kv() {
  local file="$1"
  local key="$2"
  [ -f "${file}" ] || return 1
  local line
  line="$(grep -E "^${key}=" "${file}" 2>/dev/null | head -n 1 || true)"
  [ -n "${line}" ] || return 1
  line="${line#${key}=}"
  line="${line%\"}"
  line="${line#\"}"
  printf '%s' "${line}"
  return 0
}

if [ -z "${TRATUMOS_CONSOLE_LANG:-}" ] && [ -f /etc/default/locale ]; then
  # Convert "en_GB.UTF-8" -> "en-GB" for Chromium's --lang.
  lang="$(read_kv /etc/default/locale LANG || true)"
  lang="${lang%%.*}"
  lang="${lang/_/-}"
  if [ -n "${lang}" ]; then
    TRATUMOS_CONSOLE_LANG="${lang}"
  fi
fi

# Prefer system keyboard settings if present (Debian: /etc/default/keyboard).
if [ -f /etc/default/keyboard ]; then
  XKB_DEFAULT_MODEL="${XKB_DEFAULT_MODEL:-$(read_kv /etc/default/keyboard XKBMODEL || true)}"
  XKB_DEFAULT_LAYOUT="${XKB_DEFAULT_LAYOUT:-$(read_kv /etc/default/keyboard XKBLAYOUT || true)}"
  XKB_DEFAULT_VARIANT="${XKB_DEFAULT_VARIANT:-$(read_kv /etc/default/keyboard XKBVARIANT || true)}"
  XKB_DEFAULT_OPTIONS="${XKB_DEFAULT_OPTIONS:-$(read_kv /etc/default/keyboard XKBOPTIONS || true)}"
  export XKB_DEFAULT_MODEL XKB_DEFAULT_LAYOUT XKB_DEFAULT_VARIANT XKB_DEFAULT_OPTIONS
fi

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
  ${TRATUMOS_CONSOLE_LANG:+--lang="${TRATUMOS_CONSOLE_LANG}"} \
  --enable-features=UseOzonePlatform \
  --ozone-platform=wayland \
  --no-first-run \
  --no-default-browser-check \
  --disable-session-crashed-bubble \
  --disable-infobars \
  --disable-features=TranslateUI \
  --disable-translate \
  --autoplay-policy=no-user-gesture-required
