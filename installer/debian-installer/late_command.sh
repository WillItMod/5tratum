#!/bin/sh
set -eu

LOG_FILE="/root/late_command.log"
exec >"${LOG_FILE}" 2>&1
set -x

log() { echo "[5tratumOS late_command] $*" >&2; }

CDROM_BUNDLE="/root/5tratumos-update.tgz"
TMP_DIR="/root/5tratumos-install"
STAGE_DIR="${TMP_DIR}/stage"

if [ ! -f "${CDROM_BUNDLE}" ] && [ -f "/cdrom/5tratumos/5tratumos-update.tgz" ]; then
  CDROM_BUNDLE="/cdrom/5tratumos/5tratumos-update.tgz"
fi

if [ ! -f "${CDROM_BUNDLE}" ]; then
  log "Missing bundle on install media: ${CDROM_BUNDLE}"
  exit 1
fi

log "Ensuring DNS is configured for apt..."
# In Debian Installer chroot, /etc/resolv.conf may be a stub symlink which won't work.
rm -f /etc/resolv.conf || true
cat >/etc/resolv.conf <<'EOF'
nameserver 1.1.1.1
nameserver 8.8.8.8
EOF

log "Removing cdrom APT sources (avoid missing Release errors)..."
if [ -f /etc/apt/sources.list ]; then
  sed -i '/^deb cdrom:/d' /etc/apt/sources.list || true
fi
rm -f /etc/apt/sources.list.d/cdrom.list || true

log "Installing base packages..."
export DEBIAN_FRONTEND=noninteractive
tries=0
while :; do
  tries=$((tries + 1))
  if apt-get update -y; then
    break
  fi
  if [ "${tries}" -ge 5 ]; then
    log "apt-get update failed after ${tries} attempts"
    exit 100
  fi
  sleep 3
done

apt-get install -y --no-install-recommends ca-certificates curl gnupg jq python3 python3-yaml

log "Installing Docker + Compose..."
if ! command -v docker >/dev/null 2>&1; then
  # On Debian 13, docker.io may not ship the `docker` client binary; install docker-cli too.
  apt-get install -y --no-install-recommends docker.io docker-cli containerd
fi

if ! command -v docker-compose >/dev/null 2>&1 && apt-cache show docker-compose >/dev/null 2>&1; then
  apt-get install -y --no-install-recommends docker-compose || true
fi

log "Extracting and installing 5tratumOS bundle..."
rm -rf "${TMP_DIR}"
mkdir -p "${STAGE_DIR}"
tar -xzf "${CDROM_BUNDLE}" -C "${STAGE_DIR}"

install -d -m 0755 /opt/5tratumos
rm -rf /opt/5tratumos/overlay /opt/5tratumos/apps-available /opt/5tratumos/daemon /opt/5tratumos/console /opt/5tratumos/bootstrap || true

cp -a "${STAGE_DIR}/overlay" /opt/5tratumos/overlay
cp -a "${STAGE_DIR}/daemon" /opt/5tratumos/daemon
if [ -d "${STAGE_DIR}/bootstrap" ]; then
  cp -a "${STAGE_DIR}/bootstrap" /opt/5tratumos/bootstrap
fi
if [ -d "${STAGE_DIR}/apps-available" ]; then
  cp -a "${STAGE_DIR}/apps-available" /opt/5tratumos/apps-available
fi
if [ -d "${STAGE_DIR}/console" ]; then
  cp -a "${STAGE_DIR}/console" /opt/5tratumos/console
fi

install -d -m 0755 /var/lib/5tratumos/apps
install -d -m 0755 /etc/5tratumos

if [ -f "${STAGE_DIR}/bin/5tratumos" ]; then
  install -m 0755 "${STAGE_DIR}/bin/5tratumos" /usr/local/bin/5tratumos
fi

# Ensure update channel defaults to main and update repo is public repo.
echo "main" >/etc/5tratumos/channel
cat >/etc/5tratumos/update.json <<'JSON'
{"repo":"WillItMod/5tratum","token":""}
JSON

# Install/enable systemd units shipped in the bundle.
install -m 0644 "${STAGE_DIR}/systemd/5tratumosd.service" /etc/systemd/system/5tratumosd.service
install -m 0644 "${STAGE_DIR}/systemd/5tratumos-overlay.service" /etc/systemd/system/5tratumos-overlay.service
install -m 0644 "${STAGE_DIR}/systemd/5tratumos-firstboot.service" /etc/systemd/system/5tratumos-firstboot.service

# Fallback for distros without docker compose plugin: use docker-compose if available.
if ! docker compose version >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
  sed -i 's#/usr/bin/docker compose#/usr/bin/docker-compose#g' /etc/systemd/system/5tratumos-overlay.service || true
fi

# systemctl inside installer chroot should run offline (systemd isn't PID1 yet).
SYSTEMD_OFFLINE=1 systemctl enable 5tratumosd.service 5tratumos-overlay.service 5tratumos-firstboot.service

log "Applying basic kiosk-friendly defaults (sleep disabled)..."
install -d -m 0755 /etc/systemd/logind.conf.d
cat >/etc/systemd/logind.conf.d/5tratumos.conf <<'EOF'
[Login]
IdleAction=ignore
IdleActionSec=0
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
HandleLidSwitchDocked=ignore
EOF
SYSTEMD_OFFLINE=1 systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target >/dev/null 2>&1 || true

log "Cleanup..."
rm -rf "${TMP_DIR}"

log "5tratumOS installation complete."
