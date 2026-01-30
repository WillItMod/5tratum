#!/usr/bin/env bash
set -euo pipefail

ACTIVE_FILE="/sys/class/tty/tty0/active"
VT="${TRATUMOS_CONSOLE_VT:-7}"
AUTO_CHVT="${TRATUMOS_CONSOLE_AUTO_CHVT:-1}"
AUTO_WAIT_SECS="${TRATUMOS_CONSOLE_AUTO_CHVT_WAIT_SECS:-30}"

log() {
  printf '[5tratumos-console-vt] %s\n' "$*" >&2
}

active_vt() {
  [ -r "${ACTIVE_FILE}" ] || return 1
  local v
  v="$(cat "${ACTIVE_FILE}" 2>/dev/null || true)"
  if [[ "${v}" =~ ^tty([0-9]+)$ ]]; then
    printf '%s' "${BASH_REMATCH[1]}"
    return 0
  fi
  return 1
}

do_chvt() {
  local target="$1"
  if command -v chvt >/dev/null 2>&1; then
    chvt "${target}" >/dev/null 2>&1 || return 1
    return 0
  fi
  # Fallback: openvt can also switch VTs on many systems.
  if command -v openvt >/dev/null 2>&1; then
    openvt -c "${target}" -s -- true >/dev/null 2>&1 || return 1
    return 0
  fi
  return 1
}

has_kiosk_process() {
  local user="$1"
  [ -n "${user}" ] || return 1

  if command -v pgrep >/dev/null 2>&1; then
    pgrep -u "${user}" -x cage >/dev/null 2>&1 && return 0
    pgrep -u "${user}" -x xinit >/dev/null 2>&1 && return 0
    pgrep -u "${user}" -x chromium >/dev/null 2>&1 && return 0
    # Chromium may appear as "chromium-browser" on some distros.
    pgrep -u "${user}" -x chromium-browser >/dev/null 2>&1 && return 0
    return 1
  fi

  ps -u "${user}" -o comm= 2>/dev/null | grep -E '^(cage|xinit|chromium|chromium-browser)$' >/dev/null 2>&1
}

cmd="${1:-}"
case "${cmd}" in
  start)
    [ "${AUTO_CHVT}" = "1" ] || exit 0
    user="${2:-}"
    a="$(active_vt || true)"
    if [ "${a}" = "1" ] && [ "${VT}" != "1" ]; then
      # Wait until the kiosk session is actually starting; switching too early can show a blank VT.
      if [ -n "${user}" ]; then
        for _ in $(seq 1 "${AUTO_WAIT_SECS}"); do
          if has_kiosk_process "${user}"; then
            break
          fi
          sleep 1
        done
      fi
      if do_chvt "${VT}"; then
        log "switched to tty${VT}"
      else
        log "warn: failed to switch to tty${VT}"
      fi
    fi
    ;;
  stop)
    [ "${AUTO_CHVT}" = "1" ] || exit 0
    a="$(active_vt || true)"
    if [ "${a}" = "${VT}" ]; then
      if do_chvt 1; then
        log "kiosk stopped; returned to tty1"
      else
        log "warn: failed to switch back to tty1"
      fi
    fi
    ;;
  *)
    echo "usage: ${0##*/} start|stop" >&2
    exit 2
    ;;
esac
