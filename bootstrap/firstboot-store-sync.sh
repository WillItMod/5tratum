#!/usr/bin/env bash
set -euo pipefail

DONE_FILE="/etc/5tratumos/firstboot-store-sync.done"
STATUS_FILE="/etc/5tratumos/firstboot-store-sync.status"

log() { printf '[5tratumos-firstboot-store-sync] %s\n' "$*" >&2; }

write_status() {
  local state="$1"
  local message="$2"
  local ts
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || true)"
  install -d -m 0755 "$(dirname "${STATUS_FILE}")"
  cat >"${STATUS_FILE}" <<EOF
{"ok":true,"state":"${state}","message":"${message}","time":"${ts}"}
EOF
}

if [ -f "${DONE_FILE}" ]; then
  write_status "done" "already completed"
  exit 0
fi

write_status "running" "syncing app store (main/dev)..."

have_net() {
  curl -fsSL --max-time 5 https://github.com/ >/dev/null 2>&1
}

if ! have_net; then
  write_status "skipped" "offline: store sync skipped"
  touch "${DONE_FILE}"
  exit 0
fi

if ! command -v /usr/local/bin/5tratumos >/dev/null 2>&1; then
  write_status "failed" "missing 5tratumos CLI"
  touch "${DONE_FILE}"
  exit 0
fi

set +e
/usr/local/bin/5tratumos store sync main >/dev/null 2>&1
main_rc=$?
/usr/local/bin/5tratumos store sync dev >/dev/null 2>&1
dev_rc=$?
set -e

if [ "${main_rc}" -eq 0 ] && [ "${dev_rc}" -eq 0 ]; then
  write_status "done" "store synced"
else
  write_status "failed" "store sync failed (main=${main_rc}, dev=${dev_rc})"
fi

touch "${DONE_FILE}"
log "done"

