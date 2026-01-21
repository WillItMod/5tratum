#!/usr/bin/env bash
set -euo pipefail

DONE_FILE="/etc/5tratumos/firstboot-update.done"

mkdir -p /etc/5tratumos

log() { printf '[5tratumos-firstboot-update] %s\n' "$*" >&2; }

if [ -f "${DONE_FILE}" ]; then
  exit 0
fi

# Skip fast if we look offline.
if command -v curl >/dev/null 2>&1; then
  if ! curl -fsS --max-time 4 https://api.github.com/meta >/dev/null 2>&1; then
    log "Offline (or GitHub unreachable); skipping auto-update."
    date -u +"%Y-%m-%dT%H:%M:%SZ offline" >"${DONE_FILE}" || true
    exit 0
  fi
fi

if [ ! -f /opt/5tratumos/daemon/5tratumosd.py ]; then
  log "Missing daemon file; skipping auto-update."
  date -u +"%Y-%m-%dT%H:%M:%SZ missing-daemon" >"${DONE_FILE}" || true
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
    # If a token is required or anything else fails, just skip (user can run update later).
    sys.stderr.write(f"[5tratumos-firstboot-update] update check skipped: {chk.get('error') if isinstance(chk, dict) else 'unknown'}\n")
    sys.exit(0)

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
    sys.exit(0)

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
sys.exit(0)
PY
rc=$?

date -u +"%Y-%m-%dT%H:%M:%SZ" >"${DONE_FILE}" || true

if [ "${rc}" -eq 42 ]; then
  log "Rebooting after update."
  systemctl reboot || reboot || true
fi

exit 0

