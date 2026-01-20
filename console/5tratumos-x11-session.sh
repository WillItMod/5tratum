#!/usr/bin/env bash
set -euo pipefail

URL="${TRATUMOS_CONSOLE_URL:-http://127.0.0.1/}"

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

lang=""
if [ -z "${TRATUMOS_CONSOLE_LANG:-}" ] && [ -f /etc/default/locale ]; then
  lang="$(read_kv /etc/default/locale LANG || true)"
  lang="${lang%%.*}"
  lang="${lang/_/-}"
fi
if [ -n "${TRATUMOS_CONSOLE_LANG:-}" ]; then
  lang="${TRATUMOS_CONSOLE_LANG}"
fi
if [ "${lang}" = "C" ] || [ "${lang}" = "POSIX" ]; then
  lang=""
fi

xset -dpms || true
xset s off || true
xset s noblank || true

if command -v matchbox-window-manager >/dev/null 2>&1; then
  matchbox-window-manager -use_cursor no >/dev/null 2>&1 &
fi

chromium_args=(
  "--kiosk"
  "--noerrdialogs"
  "--disable-translate"
  "--disable-features=TranslateUI"
  "--disable-session-crashed-bubble"
  "--disable-infobars"
  "--no-first-run"
  "--no-default-browser-check"
  "--autoplay-policy=no-user-gesture-required"
)

if [ -n "${lang}" ]; then
  chromium_args+=("--lang=${lang}")
fi

if [ "${TRATUMOS_CONSOLE_SWGL:-0}" = "1" ]; then
  chromium_args+=("--disable-gpu" "--use-gl=swiftshader")
  export LIBGL_ALWAYS_SOFTWARE=1
fi

if [ "${TRATUMOS_CONSOLE_ENABLE_LOGGING:-0}" = "1" ]; then
  chromium_args+=("--enable-logging=stderr" "--v=1")
fi

if [ -n "${TRATUMOS_CONSOLE_CHROMIUM_FLAGS:-}" ]; then
  # shellcheck disable=SC2206
  chromium_args+=(${TRATUMOS_CONSOLE_CHROMIUM_FLAGS})
fi

exec /usr/bin/chromium "${chromium_args[@]}" "${URL}"
