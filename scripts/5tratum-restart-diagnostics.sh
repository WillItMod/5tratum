#!/usr/bin/env bash
set +e

# 5tratumOS restart diagnostics collector.
# Read-only: does not restart services, stop containers, repair filesystems,
# edit configuration, wipe data, or install packages.

if [ "${EUID:-$(id -u)}" -eq 0 ] && [ -n "${SUDO_USER:-}" ] && [ -d "/home/${SUDO_USER}" ]; then
  OUT_DIR="/home/${SUDO_USER}"
else
  OUT_DIR="${HOME}"
fi

OUT="${OUT_DIR}/5tratum-restart-diagnostics-$(hostname)-$(date +%Y%m%d-%H%M%S).txt"
APP_PATTERN='axedgb|dgb|digibyte|axebch|bch|bitcoin-cash|bitcoincash|bchn|bchd|miningcore|postgres'

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

install_tool_packages() {
  missing_packages=()

  command -v smartctl >/dev/null 2>&1 || missing_packages+=("smartmontools")
  command -v nvme >/dev/null 2>&1 || missing_packages+=("nvme-cli")
  command -v dmidecode >/dev/null 2>&1 || missing_packages+=("dmidecode")
  command -v lspci >/dev/null 2>&1 || missing_packages+=("pciutils")
  command -v sensors >/dev/null 2>&1 || missing_packages+=("lm-sensors")
  command -v fsck.vfat >/dev/null 2>&1 || missing_packages+=("dosfstools")

  if [ "${#missing_packages[@]}" -eq 0 ]; then
    echo "All preferred diagnostic tools are already installed."
    return
  fi

  echo "Missing diagnostic packages: ${missing_packages[*]}"
  if ! command -v apt-get >/dev/null 2>&1; then
    echo "apt-get not found, cannot install missing diagnostic tools."
    return
  fi

  sudo_run apt-get update
  sudo_run env DEBIAN_FRONTEND=noninteractive apt-get install -y "${missing_packages[@]}"
}

capture() {
  "${SUDO[@]}" sh -c "$1" 2>/dev/null
}

setup_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    DOCKER=()
    return
  fi

  if docker ps >/dev/null 2>&1; then
    DOCKER=(docker)
  else
    DOCKER=("${SUDO[@]}" docker)
  fi
}

first_started_for_pattern() {
  pattern="$1"
  [ "${#DOCKER[@]}" -gt 0 ] || return
  "${DOCKER[@]}" ps -aq | while read -r id; do
    name="$("${DOCKER[@]}" inspect --format '{{.Name}}' "$id" 2>/dev/null)"
    image="$("${DOCKER[@]}" inspect --format '{{.Config.Image}}' "$id" 2>/dev/null)"
    echo "$name $image" | grep -Eiq "$pattern" || continue
    started="$("${DOCKER[@]}" inspect --format '{{.State.StartedAt}}' "$id" 2>/dev/null)"
    [ -n "$started" ] && [ "$started" != "0001-01-01T00:00:00Z" ] && echo "$started $name"
  done | sort | head -1 | awk '{print $1}'
}

restart_state_for_pattern() {
  pattern="$1"
  [ "${#DOCKER[@]}" -gt 0 ] || return
  "${DOCKER[@]}" ps -aq | while read -r id; do
    name="$("${DOCKER[@]}" inspect --format '{{.Name}}' "$id" 2>/dev/null)"
    image="$("${DOCKER[@]}" inspect --format '{{.Config.Image}}' "$id" 2>/dev/null)"
    echo "$name $image" | grep -Eiq "$pattern" || continue
    "${DOCKER[@]}" inspect --format '{{.Name}} restart={{.RestartCount}} oom={{.State.OOMKilled}} status={{.State.Status}} exit={{.State.ExitCode}} started={{.State.StartedAt}} finished={{.State.FinishedAt}} image={{.Config.Image}} error={{.State.Error}}' "$id"
  done | sort
}

setup_docker

UPTIME_SECONDS="$(cut -d. -f1 /proc/uptime 2>/dev/null)"
UPTIME_HUMAN="$(uptime 2>/dev/null)"
BOOT_LOCAL="$(uptime -s 2>/dev/null)"
BOOT_UTC_MINUTE=""
if [ -n "$BOOT_LOCAL" ]; then
  BOOT_UTC_MINUTE="$(date -u -d "$BOOT_LOCAL" +%Y-%m-%dT%H:%M 2>/dev/null)"
fi

CRASH_BOOT_COUNT_LAST_HISTORY="$(last -x reboot shutdown 2>/dev/null | head -80 | grep -c 'crash' || true)"
LAST_SINCE_48="$(date -d '48 hours ago' +%Y%m%d%H%M%S 2>/dev/null)"
if [ -n "$LAST_SINCE_48" ]; then
  CRASH_BOOT_COUNT_48="$(last -x -s "$LAST_SINCE_48" reboot shutdown 2>/dev/null | grep -c 'crash' || true)"
else
  CRASH_BOOT_COUNT_48="unknown"
fi
DOCKER_START_COUNT="$(capture "journalctl -u docker --since '48 hours ago' --no-pager | grep -c 'Starting docker.service\\|Starting Docker' || true")"
OOM_COUNT="$(capture "journalctl -k --since '48 hours ago' --no-pager | grep -Eic 'out of memory|oom-kill|killed process' || true")"
DIRTY_STORAGE_COUNT="$(capture "journalctl -k --since '48 hours ago' --no-pager | grep -Eic 'orphan cleanup|not properly unmounted|journal.*corrupt|filesystem.*corrupt|EXT4-fs error|FAT-fs.*corrupt|fsck' || true")"
NVME_ERROR_COUNT="$(capture "journalctl -k --since '48 hours ago' --no-pager | grep -Eic 'nvme.*reset|nvme.*timeout|nvme.*abort|I/O error|blk_update_request|Buffer I/O error' || true")"
CRITICAL_HARDWARE_COUNT="$(capture "journalctl -k --since '48 hours ago' --no-pager | grep -Eic 'thermal shutdown|critical temperature|temperature above threshold|watchdog.*(hard|soft|lockup|timeout|reset|bite|panic)|soft lockup|hard lockup|kernel panic|panic:|hung task|blocked for more than|mce|machine check|hardware error|NMI.*hard lockup' || true")"
PSTORE_COUNT="$(capture "test -d /sys/fs/pstore && find /sys/fs/pstore -type f 2>/dev/null | wc -l || echo 0")"

DGB_STARTED="$(first_started_for_pattern 'axedgb|digibyte|dgbd')"
BCH_STARTED="$(first_started_for_pattern 'axebch|bitcoin-cash|bitcoincash|bchn|bchd')"
DGB_STARTED_MINUTE="${DGB_STARTED:0:16}"
BCH_STARTED_MINUTE="${BCH_STARTED:0:16}"

section "DIAGNOSTIC START"
echo "5tratumOS restart diagnostics"
echo "This script is read-only. It does not restart, stop, repair, wipe, edit, or install anything."
date -Is
hostname
whoami
echo "Output file: $OUT"

section "DIAGNOSTIC TOOL SETUP"
echo "Installing missing diagnostic tools if needed: smartmontools, nvme-cli, dmidecode, pciutils, lm-sensors, dosfstools."
echo "These tools are used for hardware/firmware/drive inspection only."
install_tool_packages

section "QUICK VERDICT"
echo "Uptime now: ${UPTIME_HUMAN:-unknown}"
echo "Current boot time: ${BOOT_LOCAL:-unknown}"
echo "Crash-labelled boots in last 48h: ${CRASH_BOOT_COUNT_48:-unknown}"
echo "Crash-labelled boots in visible last(1) history: ${CRASH_BOOT_COUNT_LAST_HISTORY:-unknown}"
echo "Docker service starts in last 48h: ${DOCKER_START_COUNT:-unknown}"
echo "Kernel OOM kills in last 48h: ${OOM_COUNT:-unknown}"
echo "Dirty filesystem / unclean shutdown signs in last 48h: ${DIRTY_STORAGE_COUNT:-unknown}"
echo "NVMe / block I/O error signs in last 48h: ${NVME_ERROR_COUNT:-unknown}"
echo "Critical thermal / watchdog / panic / hardware error signs in last 48h: ${CRITICAL_HARDWARE_COUNT:-unknown}"
echo "Kernel crash dump files in /sys/fs/pstore: ${PSTORE_COUNT:-unknown}"
echo "Earliest AxeDGB-related container start: ${DGB_STARTED:-not found}"
echo "Earliest AxeBCH-related container start: ${BCH_STARTED:-not found}"

if [ -n "$DGB_STARTED_MINUTE" ] && [ -n "$BCH_STARTED_MINUTE" ] && [ "$DGB_STARTED_MINUTE" = "$BCH_STARTED_MINUTE" ]; then
  echo "AxeDGB and AxeBCH started in the same minute: YES (${DGB_STARTED_MINUTE}Z)"
else
  echo "AxeDGB and AxeBCH started in the same minute: NO / unknown"
fi

if [ -n "$BOOT_UTC_MINUTE" ] && { [ "$DGB_STARTED_MINUTE" = "$BOOT_UTC_MINUTE" ] || [ "$BCH_STARTED_MINUTE" = "$BOOT_UTC_MINUTE" ]; }; then
  echo "Container start matches current host boot minute: YES (${BOOT_UTC_MINUTE}Z)"
else
  echo "Container start matches current host boot minute: NO / unknown"
fi

if [ "${OOM_COUNT:-0}" -gt 0 ]; then
  echo "Interpretation: at least one OOM event is present. Check OOM details below."
elif [ "${CRASH_BOOT_COUNT_48:-0}" != "unknown" ] && [ "${CRASH_BOOT_COUNT_48:-0}" -gt 0 ] || [ "${DIRTY_STORAGE_COUNT:-0}" -gt 0 ]; then
  echo "Interpretation: strongest evidence points to unclean host/Docker stops, not an app-only crash."
else
  echo "Interpretation: no obvious OOM or dirty-shutdown proof in the quick counters. Review raw previous boot tails below."
fi

section "SYSTEM / OS"
run uname -a
[ -r /etc/os-release ] && run cat /etc/os-release
run uptime
run sh -c 'last -x reboot shutdown 2>/dev/null | head -60 || true'

section "BOOT HISTORY"
sudo_run journalctl --list-boots --no-pager

section "RESOURCE SNAPSHOT"
run free -h
run sh -c 'command -v swapon >/dev/null 2>&1 && swapon --show || /sbin/swapon --show 2>/dev/null || true'
run sh -c 'top -b -n1 | head -35'
[ -r /proc/pressure/cpu ] && run cat /proc/pressure/cpu
[ -r /proc/pressure/memory ] && run cat /proc/pressure/memory
[ -r /proc/pressure/io ] && run cat /proc/pressure/io

section "FIRMWARE / BOARD"
run hostnamectl
if command -v dmidecode >/dev/null 2>&1; then
  sudo_run dmidecode -t bios -t system -t baseboard -t chassis
else
  echo "dmidecode not installed. Firmware/board details unavailable."
fi
if command -v lspci >/dev/null 2>&1; then
  sudo_run lspci -nnk
else
  echo "lspci not installed. PCI device details unavailable."
fi
if command -v sensors >/dev/null 2>&1; then
  run sensors
else
  echo "lm-sensors not installed. Temperature sensor snapshot unavailable."
fi

section "PSTORE / KERNEL CRASH DUMPS"
if "${SUDO[@]}" test -d /sys/fs/pstore; then
  sudo_run sh -c 'ls -la /sys/fs/pstore || true'
  sudo_run sh -c 'for f in /sys/fs/pstore/*; do [ -f "$f" ] || continue; echo; echo "---- $f ----"; sed -n "1,220p" "$f" 2>/dev/null || strings "$f" 2>/dev/null | head -220 || true; done'
else
  echo "/sys/fs/pstore is not available. Kernel panic/watchdog crash dumps were not captured."
fi

section "DISK / MOUNTS"
run sh -c 'df -hT -x overlay -x tmpfs -x devtmpfs -x squashfs 2>/dev/null || df -h'
run sh -c 'lsblk -o NAME,MODEL,SIZE,FSTYPE,MOUNTPOINT,ROTA,TYPE,SERIAL 2>/dev/null || lsblk'
run sh -c 'findmnt / 2>/dev/null || true'
run sh -c 'findmnt /var/lib/docker 2>/dev/null || true'
run sh -c 'for target in / /boot /boot/efi /var/lib/docker /home /mnt/5tratum-1tb-ssd; do findmnt -rn -o SOURCE,TARGET,FSTYPE,OPTIONS "$target" 2>/dev/null || true; done'

section "SMART / NVME HEALTH IF AVAILABLE"
if command -v smartctl >/dev/null 2>&1; then
  for disk in /dev/nvme0n1 /dev/nvme1n1 /dev/sda /dev/sdb /dev/vda; do
    [ -b "$disk" ] && sudo_run smartctl -x "$disk"
  done
else
  echo "smartctl not installed. NVMe/SATA SMART health was not available."
fi

if command -v nvme >/dev/null 2>&1; then
  for dev in /dev/nvme0 /dev/nvme1; do
    [ -e "$dev" ] && sudo_run nvme smart-log "$dev"
  done
else
  echo "nvme-cli not installed. NVMe controller health was not available."
fi

section "FILESYSTEM STATE IF AVAILABLE"
root_source="$(findmnt -rn -o SOURCE / 2>/dev/null)"
if [ -n "$root_source" ] && command -v tune2fs >/dev/null 2>&1; then
  sudo_run sh -c "tune2fs -l '$root_source' 2>/dev/null | grep -Ei 'filesystem state|error count|mount count|maximum mount count|last checked|check interval|lifetime writes' || true"
else
  echo "Root filesystem tune2fs state unavailable."
fi

for boot_dev in /dev/nvme0n1p1 /dev/sda1 /dev/vda1; do
  [ -b "$boot_dev" ] || continue
  if command -v fsck.vfat >/dev/null 2>&1; then
    echo
    echo "+ sudo fsck.vfat -n $boot_dev"
    "${SUDO[@]}" fsck.vfat -n "$boot_dev" 2>&1 | head -120 || true
  fi
done

section "DOCKER VERSION / INFO"
if [ "${#DOCKER[@]}" -gt 0 ]; then
  run "${DOCKER[@]}" version
  run "${DOCKER[@]}" info
else
  echo "Docker not found or not accessible."
fi

section "ALL CONTAINERS"
if [ "${#DOCKER[@]}" -gt 0 ]; then
  run "${DOCKER[@]}" ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.RunningFor}}\t{{.Image}}'
fi

section "AXEDGB / AXEBCH RESTART / OOM STATE"
restart_state_for_pattern "$APP_PATTERN"

section "AXEDGB / AXEBCH CONTAINER MOUNTS"
if [ "${#DOCKER[@]}" -gt 0 ]; then
  "${DOCKER[@]}" ps -aq | while read -r id; do
    name="$("${DOCKER[@]}" inspect --format '{{.Name}}' "$id" 2>/dev/null)"
    image="$("${DOCKER[@]}" inspect --format '{{.Config.Image}}' "$id" 2>/dev/null)"
    echo "$name $image" | grep -Eiq "$APP_PATTERN" || continue
    "${DOCKER[@]}" inspect --format '{{.Name}} mounts={{range .Mounts}}{{.Source}} -> {{.Destination}}; {{end}}' "$id"
  done | sort
fi

section "CURRENT BOOT KERNEL FLAGS"
sudo_run sh -c 'journalctl -k -b 0 --no-pager -o short-iso | grep -Ei "oom|killed process|nvme|i/o error|blk_update|ext4|fat-fs|fsck|orphan|corrupt|reset|thermal shutdown|critical temperature|temperature above threshold|watchdog.*(hard|soft|lockup|timeout|reset|bite|panic)|soft lockup|hard lockup|kernel panic|panic:|mce|machine check|hardware error|segfault|hung task|blocked for more than" | tail -300 || true'

section "PREVIOUS BOOT RAW TAIL"
sudo_run sh -c 'journalctl -b -1 --no-pager -o short-iso 2>/dev/null | tail -500 || true'

section "PREVIOUS BOOT KERNEL RAW TAIL"
sudo_run sh -c 'journalctl -k -b -1 --no-pager -o short-iso 2>/dev/null | tail -500 || true'

section "PREVIOUS 5 BOOT ERROR SUMMARIES"
for BOOT in -1 -2 -3 -4 -5; do
  echo
  echo "---- BOOT $BOOT ----"
  sudo_run sh -c "journalctl -b '$BOOT' --no-pager -o short-iso 2>/dev/null | grep -Ei 'shutdown|reboot|power key|power button|ACPI.*button|thermal shutdown|critical temperature|temperature above threshold|panic|watchdog.*(hard|soft|lockup|timeout|reset|bite|panic)|soft lockup|hard lockup|kernel panic|mce|machine check|hardware error|error|fail|nvme|i/o error|ext4|fat-fs|fsck|docker|container|killed|oom|invalid character|stale sandbox|segfault|hung task|blocked for more than' | tail -180 || true"
done

section "POWER / WATCHDOG / REBOOT SOURCE HINTS"
sudo_run sh -c 'journalctl --since "48 hours ago" --no-pager -o short-iso | grep -Ei "power key|power button|ACPI.*button|systemd-logind.*Power|reboot:|Restarting system|systemd-shutdown|shutdown.target|reboot.target|poweroff.target|watchdog.*(hard|soft|lockup|timeout|reset|bite|panic)|soft lockup|hard lockup|kernel panic|panic:|thermal shutdown|critical temperature|temperature above threshold|mce|machine check|hardware error" | tail -300 || true'

section "WATCHDOG / REBOOT UNITS"
run sh -c 'systemctl list-units --all --no-pager | grep -Ei "watchdog|reboot|shutdown|power" || true'
run sh -c 'systemctl list-timers --all --no-pager | grep -Ei "watchdog|reboot|shutdown|power" || true'
sudo_run sh -c 'grep -RIE "WatchdogSec|RuntimeWatchdogSec|ShutdownWatchdogSec|reboot|shutdown|poweroff" /etc/systemd /lib/systemd/system /usr/lib/systemd/system 2>/dev/null | head -220 || true'

section "DOCKER JOURNAL LAST 48 HOURS"
sudo_run sh -c 'journalctl -u docker --since "48 hours ago" --no-pager -o short-iso | grep -Ei "Starting Docker|Started Docker|Starting docker.service|Started docker.service|Docker daemon|Daemon shutdown|stale sandbox|invalid character|Error streaming logs|ShouldRestart|failed|error|oom|killed|restart|container|manuallyStopped" | tail -500 || true'

section "SYSTEM JOURNAL LAST 48 HOURS: APPS / DOCKER / STORAGE"
sudo_run sh -c 'journalctl --since "48 hours ago" --no-pager -o short-iso | grep -Ei "axedgb|digibyte|dgbd|axebch|bitcoin-cash|bitcoincash|bchn|bchd|miningcore|postgres|docker|container|nvme|ext4|fat-fs|i/o error|oom|killed|thermal|watchdog|panic|invalid character|stale sandbox|mce|machine check|hardware error|segfault|hung task|blocked for more than" | tail -900 || true'

section "DOCKER JSON LOG NULL BYTE SCAN"
if "${SUDO[@]}" test -d /var/lib/docker/containers && command -v python3 >/dev/null 2>&1; then
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
    print("No null bytes found in Docker JSON logs.")
PY
elif "${SUDO[@]}" test -d /var/lib/docker/containers; then
  echo "python3 not installed, skipping Docker JSON log null byte scan."
else
  echo "/var/lib/docker/containers not found or not accessible."
fi

section "RECENT APP CONTAINER LOG ERROR TAILS"
if [ "${#DOCKER[@]}" -gt 0 ]; then
  "${DOCKER[@]}" ps -a --format '{{.Names}} {{.Image}}' | grep -Ei "$APP_PATTERN" | awk '{print $1}' | while read -r name; do
    echo
    echo "---- $name ----"
    "${DOCKER[@]}" logs --since 48h --tail 220 "$name" 2>&1 | grep -Ei 'fatal|error|exception|panic|timeout|timed out|connection refused|database is locked|disk|corrupt|killed|oom|restart|shutdown|terminated|failed|warn' | tail -120 || true
  done
fi

section "NETWORK SNAPSHOT"
run ip -br addr
run ip route
[ -r /etc/resolv.conf ] && run cat /etc/resolv.conf
run sh -c 'getent hosts github.com || true'
run sh -c 'getent hosts seed.digibyte.io || true'
run sh -c 'getent hosts dnsseed.digibyte.io || true'

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
echo "To show the newest restart diagnostics file path, run:"
echo "ls -1t \"${OUT_DIR}\"/5tratum-restart-diagnostics-*.txt | head -1"

if [ "${EUID:-$(id -u)}" -eq 0 ] && [ -n "${SUDO_USER:-}" ]; then
  chown "${SUDO_USER}:${SUDO_USER}" "$OUT" 2>/dev/null || true
fi
