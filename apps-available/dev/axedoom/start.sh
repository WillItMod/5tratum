#!/bin/sh
set -eu

export DISPLAY="${DISPLAY:-:0}"
export HOME="${HOME:-/data}"
export SDL_AUDIODRIVER="${SDL_AUDIODRIVER:-dummy}"
export SDL_VIDEODRIVER="${SDL_VIDEODRIVER:-x11}"

RESOLUTION="${RESOLUTION:-1280x720}"
DEPTH="${DEPTH:-24}"

ensure_iwad() {
  if [ -n "${IWAD_PATH:-}" ] && [ -f "${IWAD_PATH}" ]; then
    echo "${IWAD_PATH}"
    return 0
  fi

  for p in \
    /usr/share/games/doom/freedoom2.wad \
    /usr/share/games/doom/freedoom1.wad \
    /usr/share/games/freedoom/freedoom2.wad \
    /usr/share/games/freedoom/freedoom1.wad \
    /usr/share/games/freedoom/*.wad \
    ; do
    if [ -f "${p}" ]; then
      echo "${p}"
      return 0
    fi
  done

  found="$(find /usr/share -maxdepth 5 -type f \\( -name 'freedoom2.wad' -o -name 'freedoom1.wad' \\) 2>/dev/null | head -n 1 || true)"
  if [ -n "${found}" ] && [ -f "${found}" ]; then
    echo "${found}"
    return 0
  fi

  return 1
}

IWAD="$(ensure_iwad || true)"
if [ -z "${IWAD}" ]; then
  echo "No Freedoom IWAD found. Is the freedoom package installed?" >&2
  exit 1
fi

cleanup() {
  kill "${doom_pid:-}" "${ws_pid:-}" "${vnc_pid:-}" "${wm_pid:-}" "${xvfb_pid:-}" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

Xvfb "${DISPLAY}" -screen 0 "${RESOLUTION}x${DEPTH}" -ac +extension RANDR +render -noreset &
xvfb_pid=$!

fluxbox -display "${DISPLAY}" >/dev/null 2>&1 &
wm_pid=$!

x11vnc -display "${DISPLAY}" -forever -shared -nopw -rfbport 5900 -noxdamage -repeat -quiet &
vnc_pid=$!

NOVNC_WEB="${NOVNC_WEB:-/usr/share/novnc}"
websockify --web="${NOVNC_WEB}" 8080 localhost:5900 >/dev/null 2>&1 &
ws_pid=$!

chocolate-doom -iwad "${IWAD}" -window -width 1024 -height 768 -nograbmouse &
doom_pid=$!

wait "${doom_pid}"
