#!/usr/bin/env bash
set -euo pipefail

URL="${TRATUMOS_CONSOLE_URL:-http://127.0.0.1/login.html}"
HEALTH_URL="${TRATUMOS_CONSOLE_HEALTH_URL:-http://127.0.0.1/login.html}"
WAIT_SECS="${TRATUMOS_CONSOLE_WAIT_SECS:-90}"

log() {
  printf '[5tratumos-console] %s\n' "$*" >&2
}

chromium_bin="${TRATUMOS_CONSOLE_CHROMIUM_BIN:-}"
if [ -z "${chromium_bin}" ]; then
  chromium_bin="$(command -v chromium 2>/dev/null || true)"
  if [ -z "${chromium_bin}" ]; then
    chromium_bin="$(command -v chromium-browser 2>/dev/null || true)"
  fi
fi
if [ -z "${chromium_bin}" ] || [ ! -x "${chromium_bin}" ]; then
  log "chromium not found (expected chromium or chromium-browser)"
  exit 1
fi

cage_bin="${TRATUMOS_CONSOLE_CAGE_BIN:-}"
if [ -z "${cage_bin}" ]; then
  cage_bin="$(command -v cage 2>/dev/null || true)"
fi
if [ -z "${cage_bin}" ] || [ ! -x "${cage_bin}" ]; then
  log "cage not found"
  exit 1
fi

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
if [ "${TRATUMOS_CONSOLE_LANG:-}" = "C" ] || [ "${TRATUMOS_CONSOLE_LANG:-}" = "POSIX" ]; then
  unset TRATUMOS_CONSOLE_LANG
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
    code="$(curl -sS -o /dev/null -w "%{http_code}" --connect-timeout 1 --max-time 2 "${HEALTH_URL}" 2>/dev/null || true)"
    # Consider the service "up" if we got *any* HTTP response (including 30x/40x like login redirects).
    if [ -n "${code}" ] && [ "${code}" != "000" ]; then
      break
    fi
    sleep 1
  done
fi

# Ensure Wayland/Xorg runtime dir is correct (systemd unit should not set it).
if [ -z "${XDG_RUNTIME_DIR:-}" ]; then
  export XDG_RUNTIME_DIR="/run/user/$(id -u)"
fi
if [ ! -d "${XDG_RUNTIME_DIR}" ]; then
  log "XDG_RUNTIME_DIR is missing: ${XDG_RUNTIME_DIR}"
  exit 1
fi

detect_backend() {
  local b="${TRATUMOS_CONSOLE_BACKEND:-}"
  b="$(printf '%s' "${b}" | tr '[:upper:]' '[:lower:]' | tr -d ' \t\r\n')"
  if [ -n "${b}" ]; then
    printf '%s' "${b}"
    return 0
  fi
  if command -v systemd-detect-virt >/dev/null 2>&1; then
    if systemd-detect-virt -q; then
      printf '%s' "x11"
      return 0
    fi
  fi
  if [ ! -e /dev/dri/card0 ]; then
    printf '%s' "x11"
    return 0
  fi
  printf '%s' "wayland"
}

backend="$(detect_backend)"
log "backend=${backend}"

if [ "${backend}" = "x11" ]; then
  # In VMs, default to software GL to avoid white/blank Chromium windows.
  if [ -z "${TRATUMOS_CONSOLE_SWGL:-}" ] && command -v systemd-detect-virt >/dev/null 2>&1; then
    if systemd-detect-virt -q; then
      export TRATUMOS_CONSOLE_SWGL=1
    fi
  fi
  export XDG_SESSION_TYPE=x11
  unset MOZ_ENABLE_WAYLAND || true
  session="/usr/local/lib/5tratumos/5tratumos-x11-session"
  if [ ! -x "${session}" ]; then
    log "missing x11 session script: ${session}"
    exit 1
  fi
  exec /usr/bin/xinit "${session}" -- :0 -nolisten tcp vt1 -keeptty
fi

export XDG_SESSION_TYPE=wayland
export MOZ_ENABLE_WAYLAND=1

# wlroots (cage) can fail to render on some virtual GPUs unless software rendering
# and/or hardware cursors are disabled. Allow safe fallbacks by default.
if [ "${TRATUMOS_CONSOLE_WLR_ALLOW_SOFTWARE:-1}" = "1" ]; then
  export WLR_RENDERER_ALLOW_SOFTWARE=1
fi
if [ "${TRATUMOS_CONSOLE_WLR_NO_HW_CURSORS:-0}" = "1" ]; then
  export WLR_NO_HARDWARE_CURSORS=1
fi

chromium_args=(
  "--app=${URL}"
  "--enable-features=UseOzonePlatform"
  "--ozone-platform=wayland"
  "--no-first-run"
  "--no-default-browser-check"
  "--disable-session-crashed-bubble"
  "--disable-infobars"
  "--disable-features=TranslateUI"
  "--disable-translate"
  "--autoplay-policy=no-user-gesture-required"
)

if [ -n "${TRATUMOS_CONSOLE_LANG:-}" ]; then
  chromium_args+=("--lang=${TRATUMOS_CONSOLE_LANG}")
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

exec "${cage_bin}" -- "${chromium_bin}" "${chromium_args[@]}"
