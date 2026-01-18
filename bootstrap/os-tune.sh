#!/usr/bin/env bash
set -euo pipefail

have() { command -v "$1" >/dev/null 2>&1; }

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "error: run as root (try: sudo $0)" >&2
  exit 1
fi

echo "[tune] Applying safe OS defaults..."

echo "[tune] Enabling fstrim.timer (SSD maintenance)..."
systemctl enable --now fstrim.timer >/dev/null 2>&1 || true

echo "[tune] Capping journald disk usage..."
install -d -m 0755 /etc/systemd/journald.conf.d
cat >/etc/systemd/journald.conf.d/5tratumos.conf <<'EOF'
[Journal]
SystemMaxUse=200M
SystemMaxFileSize=20M
MaxRetentionSec=7day
EOF
systemctl restart systemd-journald >/dev/null 2>&1 || true

echo "[tune] Enabling Docker log rotation..."
install -d -m 0755 /etc/docker
daemon_json="/etc/docker/daemon.json"
tmp_json="$(mktemp)"
current='{}'
if [ -f "${daemon_json}" ]; then
  current="$(cat "${daemon_json}" 2>/dev/null || echo '{}')"
fi

if ! have python3; then
  echo "warn: python3 not found; skipping docker daemon.json merge" >&2
else
  python3 - <<'PY' >"${tmp_json}"
import json
import sys

raw = sys.stdin.read()
try:
    cfg = json.loads(raw) if raw.strip() else {}
except Exception:
    cfg = {}

cfg.setdefault("log-driver", "json-file")
opts = cfg.setdefault("log-opts", {})
opts.setdefault("max-size", "10m")
opts.setdefault("max-file", "3")

print(json.dumps(cfg, indent=2, sort_keys=True))
PY
  install -m 0644 "${tmp_json}" "${daemon_json}"
  rm -f "${tmp_json}"
  systemctl restart docker >/dev/null 2>&1 || true
fi

echo "[tune] Done."
echo "[tune] Optional (data volume): set env FIVETRATUMOS_TUNE_DATA_EXT4=1 to apply ext4 data-volume tweaks."

if [ "${FIVETRATUMOS_TUNE_DATA_EXT4:-0}" != "1" ]; then
  exit 0
fi

echo "[tune] Applying optional ext4 tweaks for /srv/5tratumos-data (safe mode)..."

if ! have findmnt; then
  echo "warn: findmnt not found; skipping ext4 tweaks" >&2
  exit 0
fi

data_src="$(findmnt -n -o SOURCE --target /srv/5tratumos-data 2>/dev/null || true)"
data_fstype="$(findmnt -n -o FSTYPE --target /srv/5tratumos-data 2>/dev/null || true)"

if [ -z "${data_src}" ] || [ "${data_fstype}" != "ext4" ]; then
  echo "warn: /srv/5tratumos-data not mounted as ext4; skipping (src=${data_src:-none} fstype=${data_fstype:-none})" >&2
  exit 0
fi

if have tune2fs && [[ "${data_src}" == /dev/* ]]; then
  echo "[tune] Setting ext4 reserved blocks to 0% on ${data_src}..."
  tune2fs -m 0 "${data_src}" >/dev/null 2>&1 || true
else
  echo "warn: tune2fs not available or source not a block device (${data_src}); skipping reserved-block tweak" >&2
fi

echo "[tune] ext4 tweaks complete (mount options like noatime/lazytime should be set in /etc/fstab for persistence)."

