#!/usr/bin/env bash
set -euo pipefail

DONE_FILE="/etc/5tratumos/firstboot-update.done"
STATUS_FILE="/etc/5tratumos/firstboot-update.status"
BACKOFF_SECS="${TRATUMOS_FIRSTBOOT_UPDATE_BACKOFF_SECS:-1800}"

mkdir -p /etc/5tratumos

log() { printf '[5tratumos-firstboot-update] %s\n' "$*" >&2; }

write_status() {
  local reason="${1:-unknown}"
  date -u +"%Y-%m-%dT%H:%M:%SZ ${reason}" >"${STATUS_FILE}" 2>/dev/null || true
}

recent_status() {
  [ -f "${STATUS_FILE}" ] || return 1
  local ts now age
  ts="$(awk '{print $1}' "${STATUS_FILE}" 2>/dev/null || true)"
  [ -n "${ts}" ] || return 1
  now="$(date -u +%s 2>/dev/null || echo 0)"
  # GNU date supports -d; if missing, just don't back off.
  ts="$(date -u -d "${ts}" +%s 2>/dev/null || echo 0)"
  [ "${now}" -gt 0 ] 2>/dev/null || return 1
  [ "${ts}" -gt 0 ] 2>/dev/null || return 1
  age="$((now - ts))" || age=0
  [ "${age}" -lt "${BACKOFF_SECS}" ] 2>/dev/null
}

if [ -f "${DONE_FILE}" ]; then
  exit 0
fi

# Avoid hammering GitHub on reboot loops (offline/token missing). We'll retry later.
if recent_status; then
  log "Recent status exists; backing off (see ${STATUS_FILE})."
  exit 0
fi

# Skip fast if we look offline.
if command -v curl >/dev/null 2>&1; then
  if ! curl -fsS --max-time 4 https://api.github.com/meta >/dev/null 2>&1; then
    log "Offline (or GitHub unreachable); skipping auto-update."
    write_status "offline"
    exit 0
  fi
fi

if [ ! -f /opt/5tratumos/daemon/5tratumosd.py ]; then
  log "Missing daemon file; skipping auto-update."
  write_status "missing-daemon"
  exit 0
fi

# Use the daemon's updater logic directly (avoids HTTP auth/session).
python3 - <<'PY'
import importlib.util
import os
import sys
import time

path = "/opt/5tratumos/daemon/5tratumosd.py"
spec = importlib.util.spec_from_file_location("five_tratumosd", path)
mod = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(mod)  # type: ignore[attr-defined]

channel = "main"

chk = mod.system_update_check(channel)
if not isinstance(chk, dict) or chk.get("ok") is not True:
    sys.stderr.write(f"[5tratumos-firstboot-update] update check failed: {chk.get('error') if isinstance(chk, dict) else 'unknown'}\n")
    sys.exit(44)

if chk.get("token_required") is True:
    sys.stderr.write("[5tratumos-firstboot-update] token required; skipping until configured\n")
    sys.exit(43)

installed = (chk.get("installed") or {}) if isinstance(chk.get("installed"), dict) else {}
available = (chk.get("available") or {}) if isinstance(chk.get("available"), dict) else {}
installed_tag = str(installed.get("tag") or "").strip()
available_tag = str(available.get("tag") or "").strip()

if not available_tag or available_tag == installed_tag:
    sys.stderr.write("[5tratumos-firstboot-update] no update available\n")
    sys.exit(0)

sys.stderr.write(f"[5tratumos-firstboot-update] applying update: {installed_tag} -> {available_tag}\n")
res = mod.system_update_apply(channel)
if not isinstance(res, dict) or res.get("ok") is not True:
    sys.stderr.write(f"[5tratumos-firstboot-update] update apply failed: {res.get('error') if isinstance(res, dict) else 'unknown'}\n")
    sys.exit(44)

# Poll update status; daemon/overlay restarts may happen during apply.
deadline = time.time() + 60 * 20
while time.time() < deadline:
    st = mod.update_status_read()
    state = str(st.get("state") or "").strip().lower()
    # If we reached done, we can reboot to ensure kernel/userland are consistent.
    if state == "done":
        sys.stderr.write("[5tratumos-firstboot-update] update done\n")
        sys.exit(42)
    if state in {"idle", "error"}:
        # give it a bit of time to transition out of idle
        time.sleep(2)
    else:
        time.sleep(3)
sys.stderr.write("[5tratumos-firstboot-update] update timed out\n")
sys.exit(44)
PY
rc=$?

if [ "${rc}" -eq 0 ]; then
  date -u +"%Y-%m-%dT%H:%M:%SZ" >"${DONE_FILE}" || true
elif [ "${rc}" -eq 43 ]; then
  write_status "token-required"
elif [ "${rc}" -ne 42 ]; then
  write_status "update-check-failed"
fi

if [ "${rc}" -eq 42 ]; then
  date -u +"%Y-%m-%dT%H:%M:%SZ updated" >"${DONE_FILE}" || true
  log "Rebooting after update."
  systemctl reboot || reboot || true
fi

exit 0
