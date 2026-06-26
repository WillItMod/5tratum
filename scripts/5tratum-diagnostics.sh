#!/usr/bin/env bash
set +e

# 5tratumOS read-only diagnostics collector.
# This script does not restart services, stop containers, edit files, or read
# Docker app logs. It is intended for support cases where Docker/app state needs
# to be compared without touching blockchain data.

if [ "${EUID:-$(id -u)}" -eq 0 ] && [ -n "${SUDO_USER:-}" ] && [ -d "/home/${SUDO_USER}" ]; then
  OUT_DIR="/home/${SUDO_USER}"
else
  OUT_DIR="${HOME}"
fi

OUT="${OUT_DIR}/5tratum-diagnostics-$(hostname)-$(date +%Y%m%d-%H%M%S).txt"
APP_COMPARE_PATTERN='axedgb|dgb|digibyte|axebch|bch|bitcoin-cash|bitcoincash|bchn|bchd|miningcore|postgres'

exec > >(tee "$OUT") 2>&1

if [ "${EUID:-$(id -u)}" -eq 0 ]; then
  SUDO=()
else
  SUDO=(sudo)
fi

section() {
  echo
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

run() {
  echo
  echo "+ $*"
  "$@"
}

sudo_run() {
  echo
  if [ "${#SUDO[@]}" -gt 0 ]; then
    echo "+ sudo $*"
  else
    echo "+ $*"
  fi
  "${SUDO[@]}" "$@"
}

section "DIAGNOSTIC START"
echo "5tratumOS read-only diagnostics"
echo "This script does not restart, stop, repair, wipe, or modify anything."
date -Is
hostname
whoami
echo "Output file: $OUT"

section "SYSTEM / OS"
run uname -a
[ -r /etc/os-release ] && run cat /etc/os-release
run uptime
run sh -c 'last -x reboot shutdown 2>/dev/null | head -30 || true'

section "CPU / MEMORY / PRESSURE"
run free -h
run sh -c 'command -v swapon >/dev/null 2>&1 && swapon --show || /sbin/swapon --show 2>/dev/null || true'
run sh -c 'top -b -n1 | head -45'
[ -r /proc/pressure/cpu ] && run cat /proc/pressure/cpu
[ -r /proc/pressure/memory ] && run cat /proc/pressure/memory
[ -r /proc/pressure/io ] && run cat /proc/pressure/io

section "DISK / MOUNTS"
run sh -c 'df -hT -x overlay -x tmpfs -x devtmpfs -x squashfs 2>/dev/null || df -h'
run sh -c 'lsblk -o NAME,MODEL,SIZE,FSTYPE,MOUNTPOINT,ROTA,TYPE,SERIAL 2>/dev/null || lsblk'
run sh -c 'findmnt / 2>/dev/null || true'
run sh -c 'findmnt /var/lib/docker 2>/dev/null || true'
run sh -c 'for target in / /boot /boot/efi /var/lib/docker /mnt/5tratum-1tb-ssd; do findmnt -rn -o SOURCE,TARGET,FSTYPE,OPTIONS "$target" 2>/dev/null || true; done'

section "SMART / NVME HEALTH IF AVAILABLE"
if command -v smartctl >/dev/null 2>&1; then
  for disk in /dev/nvme0n1 /dev/nvme1n1 /dev/sda /dev/sdb /dev/vda; do
    [ -b "$disk" ] && sudo_run smartctl -a "$disk"
  done
else
  echo "smartctl not installed"
fi

if command -v nvme >/dev/null 2>&1; then
  for dev in /dev/nvme0 /dev/nvme1; do
    [ -e "$dev" ] && sudo_run nvme smart-log "$dev"
  done
else
  echo "nvme-cli not installed"
fi

section "NETWORK BASICS"
run ip -br addr
run ip route
[ -r /etc/resolv.conf ] && run cat /etc/resolv.conf
run sh -c 'getent hosts github.com || true'
run sh -c 'getent hosts seed.digibyte.io || true'
run sh -c 'getent hosts dnsseed.digibyte.io || true'

section "FAILED SYSTEMD UNITS"
run systemctl --failed --no-pager

section "BOOT HISTORY"
sudo_run journalctl --list-boots --no-pager

section "CURRENT BOOT KERNEL STORAGE / OOM / HARDWARE FLAGS"
sudo_run sh -c 'dmesg -T | grep -Ei "oom|killed|nvme|i/o error|blk_update|ext4|fat-fs|fsck|orphan|corrupt|reset|watchdog|thermal|panic|segfault|hung task|blocked for more than" | tail -300 || true'

section "PREVIOUS 3 BOOT ERROR SUMMARY"
for BOOT in -1 -2 -3; do
  echo
  echo "---- BOOT $BOOT ----"
  sudo_run sh -c "journalctl -b '$BOOT' --no-pager 2>/dev/null | grep -Ei 'shutdown|reboot|power|thermal|panic|watchdog|error|fail|nvme|i/o error|ext4|fat-fs|fsck|docker|container|killed|oom|invalid character|stale sandbox' | tail -160 || true"
done

section "DOCKER COMMAND SETUP"
if command -v docker >/dev/null 2>&1; then
  if docker ps >/dev/null 2>&1; then
    DOCKER=(docker)
  else
    DOCKER=("${SUDO[@]}" docker)
  fi
  run "${DOCKER[@]}" version
  run "${DOCKER[@]}" info
else
  echo "Docker not found"
  DOCKER=()
fi

section "ALL CONTAINERS"
if [ "${#DOCKER[@]}" -gt 0 ]; then
  run "${DOCKER[@]}" ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.RunningFor}}\t{{.Image}}'
fi

section "ALL CONTAINER START / FINISH / RESTART STATE"
if [ "${#DOCKER[@]}" -gt 0 ]; then
  "${DOCKER[@]}" ps -aq | while read -r id; do
    "${DOCKER[@]}" inspect --format '{{.Name}} restart={{.RestartCount}} oom={{.State.OOMKilled}} status={{.State.Status}} exit={{.State.ExitCode}} started={{.State.StartedAt}} finished={{.State.FinishedAt}} image={{.Config.Image}}' "$id"
  done | sort
fi

section "AXEDGB / AXEBCH COMPARISON CONTAINERS"
if [ "${#DOCKER[@]}" -gt 0 ]; then
  "${DOCKER[@]}" ps -a --format '{{.ID}} {{.Names}} {{.Image}} {{.Status}}' | grep -Ei "$APP_COMPARE_PATTERN" || true
fi

section "AXEDGB / AXEBCH COMPARISON STATE"
if [ "${#DOCKER[@]}" -gt 0 ]; then
  "${DOCKER[@]}" ps -aq | while read -r id; do
    name="$("${DOCKER[@]}" inspect --format '{{.Name}}' "$id" 2>/dev/null)"
    image="$("${DOCKER[@]}" inspect --format '{{.Config.Image}}' "$id" 2>/dev/null)"
    echo "$name $image" | grep -Eiq "$APP_COMPARE_PATTERN" || continue
    "${DOCKER[@]}" inspect --format '{{.Name}} restart={{.RestartCount}} oom={{.State.OOMKilled}} status={{.State.Status}} exit={{.State.ExitCode}} started={{.State.StartedAt}} finished={{.State.FinishedAt}} image={{.Config.Image}}' "$id"
  done | sort
fi

section "AXEDGB / AXEBCH CONTAINER MOUNTS"
if [ "${#DOCKER[@]}" -gt 0 ]; then
  "${DOCKER[@]}" ps -aq | while read -r id; do
    name="$("${DOCKER[@]}" inspect --format '{{.Name}}' "$id" 2>/dev/null)"
    image="$("${DOCKER[@]}" inspect --format '{{.Config.Image}}' "$id" 2>/dev/null)"
    echo "$name $image" | grep -Eiq "$APP_COMPARE_PATTERN" || continue
    "${DOCKER[@]}" inspect --format '{{.Name}} mounts={{range .Mounts}}{{.Source}} -> {{.Destination}}; {{end}}' "$id"
  done
fi

section "DOCKER JOURNAL LAST 24 HOURS"
sudo_run sh -c 'journalctl -u docker --since "24 hours ago" --no-pager | grep -Ei "Starting Docker|Started Docker|Docker daemon|Daemon shutdown|stale sandbox|invalid character|Error streaming logs|ShouldRestart|failed|error|oom|killed|restart|container" | tail -350 || true'

section "SYSTEM JOURNAL LAST 24 HOURS: AXEDGB / AXEBCH / DOCKER / STORAGE"
sudo_run sh -c 'journalctl --since "24 hours ago" --no-pager | grep -Ei "axedgb|digibyte|dgbd|axebch|bitcoin-cash|bitcoincash|bchn|bchd|miningcore|postgres|docker|container|nvme|ext4|fat-fs|i/o error|oom|killed|thermal|watchdog|invalid character|stale sandbox" | tail -650 || true'

section "DOCKER JSON LOG CORRUPTION SCAN"
if [ -d /var/lib/docker/containers ] && command -v python3 >/dev/null 2>&1; then
  sudo_run python3 - <<'PY'
import os

base = "/var/lib/docker/containers"
found = False

for root, _dirs, files in os.walk(base):
    for name in files:
        if not name.endswith("-json.log"):
            continue
        path = os.path.join(root, name)
        try:
            pos = 0
            with open(path, "rb") as f:
                while True:
                    chunk = f.read(1024 * 1024)
                    if not chunk:
                        break
                    idx = chunk.find(b"\x00")
                    if idx >= 0:
                        found = True
                        print(
                            "NULL_BYTES_FOUND "
                            f"path={path} offset~{pos + idx} size={os.path.getsize(path)}"
                        )
                        break
                    pos += len(chunk)
        except Exception as exc:
            print(f"SCAN_ERROR path={path} error={exc}")

if not found:
    print("No null bytes found in Docker json logs.")
PY
elif [ -d /var/lib/docker/containers ]; then
  echo "python3 not installed, skipping Docker JSON log corruption scan"
else
  echo "/var/lib/docker/containers not found"
fi

section "APP DATA LOCATIONS"
for base in /home/*/umbrel/app-data /opt/umbrel/app-data /var/lib/umbrel/app-data; do
  [ -d "$base" ] || continue
  echo
  echo "$base"
  find "$base" -maxdepth 1 -type d | sort | grep -Ei 'axedgb|axebch|dgb|bch|willitmod' || true
done

section "AXEDGB / AXEBCH APP FILES IF PRESENT"
for d in \
  /home/*/umbrel/app-data/*axedgb* \
  /home/*/umbrel/app-data/*axebch* \
  /opt/umbrel/app-data/*axedgb* \
  /opt/umbrel/app-data/*axebch* \
  /var/lib/umbrel/app-data/*axedgb* \
  /var/lib/umbrel/app-data/*axebch*; do
  [ -d "$d" ] || continue
  echo
  echo "APP DIR: $d"
  ls -la "$d"
  find "$d" -maxdepth 3 -type f \( -name "docker-compose.yml" -o -name "umbrel-app.yml" -o -name "*.json" \) -print
done

section "LISTENING PORTS"
sudo_run sh -c 'ss -ltnp 2>/dev/null | head -220 || true'

section "DIAGNOSTIC END"
date -Is
echo
echo "Saved diagnostic file to:"
echo "$OUT"
echo
echo "WHAT TO SEND BACK"
echo "Send the .txt file above if you can."
echo "If copying from SSH is easier, copy everything shown in this window."
echo
echo "To print the saved file again later, run:"
echo "cat \"$OUT\""
echo
echo "To show the newest diagnostics file path, run:"
echo "ls -1t \"${OUT_DIR}\"/5tratum-diagnostics-*.txt | head -1"

if [ "${EUID:-$(id -u)}" -eq 0 ] && [ -n "${SUDO_USER:-}" ]; then
  chown "${SUDO_USER}:${SUDO_USER}" "$OUT" 2>/dev/null || true
fi
