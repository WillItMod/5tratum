#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="/var/log/5tratumos-firstboot-update.log"
DONE_FILE="/etc/5tratumos/firstboot-update.done"
NET_WAIT_SECS="${TRATUMOS_FIRSTBOOT_UPDATE_NET_WAIT_SECS:-30}"

mkdir -p /etc/5tratumos

if [ -f "${DONE_FILE}" ]; then
  exit 0
fi

{
  echo "[firstboot-update] started at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

  # "Skip if offline": don't block boot for long.
  if ! command -v curl >/dev/null 2>&1; then
    echo "[firstboot-update] curl not found; skipping"
    exit 0
  fi

  online=0
  for _ in $(seq 1 "${NET_WAIT_SECS}"); do
    if curl -fsS --connect-timeout 2 --max-time 5 https://api.github.com/zen >/dev/null 2>&1; then
      online=1
      break
    fi
    sleep 1
  done
  if [ "${online}" != "1" ]; then
    echo "[firstboot-update] offline (no GitHub connectivity after ${NET_WAIT_SECS}s); skipping"
    exit 0
  fi

  if [ ! -f /opt/5tratumos/daemon/5tratumosd.py ]; then
    echo "[firstboot-update] missing /opt/5tratumos/daemon/5tratumosd.py; skipping"
    exit 0
  fi

  echo "[firstboot-update] online; checking/applying update (channel=main)"

  # Use the daemon's built-in update logic without starting the HTTP server.
  outcome="$(
    python3 - <<'PY'
import importlib.util
import json
import time

path = "/opt/5tratumos/daemon/5tratumosd.py"
spec = importlib.util.spec_from_file_location("five_tratumosd", path)
mod = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(mod)  # type: ignore

check = mod.system_update_check("main")
print(json.dumps(check, separators=(",", ":"), ensure_ascii=False))

if not isinstance(check, dict) or not check.get("ok"):
    print("OUTCOME=CHECK_FAILED")
    raise SystemExit(0)

if not check.get("update_available"):
    print("OUTCOME=NO_UPDATE")
    raise SystemExit(0)

res = mod.system_update_apply("main")
print(json.dumps(res, separators=(",", ":"), ensure_ascii=False))

if not isinstance(res, dict) or not res.get("ok"):
    err = str(res.get("error") if isinstance(res, dict) else "") if res else ""
    if "no updates" in err.lower():
        print("OUTCOME=NO_UPDATE")
    else:
        print("OUTCOME=START_FAILED")
    raise SystemExit(0)

deadline = time.time() + 60 * 20
while time.time() < deadline:
    st = mod.update_status_read()
    state = str((st or {}).get("state") or "").strip().lower()
    if state in {"done", "error"}:
        print(f"OUTCOME={state.upper()}")
        raise SystemExit(0)
    time.sleep(2)

print("OUTCOME=TIMEOUT")
raise SystemExit(0)
PY
  )"

  echo "${outcome}"

  if echo "${outcome}" | grep -q "OUTCOME=DONE"; then
    echo "[firstboot-update] update applied; rebooting"
    date -u +%Y-%m-%dT%H:%M:%SZ >"${DONE_FILE}"
    systemctl reboot
    exit 0
  fi

  if echo "${outcome}" | grep -q "OUTCOME=NO_UPDATE"; then
    echo "[firstboot-update] no update; continuing boot"
    date -u +%Y-%m-%dT%H:%M:%SZ >"${DONE_FILE}"
  elif echo "${outcome}" | grep -q "OUTCOME=CHECK_FAILED"; then
    echo "[firstboot-update] update check failed; will retry on next boot"
  elif echo "${outcome}" | grep -q "OUTCOME=START_FAILED"; then
    echo "[firstboot-update] update could not start; will retry on next boot"
  elif echo "${outcome}" | grep -q "OUTCOME=ERROR"; then
    echo "[firstboot-update] update failed; will retry on next boot"
  elif echo "${outcome}" | grep -q "OUTCOME=TIMEOUT"; then
    echo "[firstboot-update] update timed out; will retry on next boot"
  else
    echo "[firstboot-update] update status unknown; will retry on next boot"
  fi

  echo "[firstboot-update] done at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} | tee -a "${LOG_FILE}"
