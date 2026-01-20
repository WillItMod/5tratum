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

log "Ensuring firmware repos are enabled (non-free-firmware + non-free)..."
if [ -f /etc/apt/sources.list ]; then
  # Ensure common components are present so WiFi/Ethernet firmware packages can install.
  sed -i 's/\bmain\b/main contrib non-free-firmware non-free/g' /etc/apt/sources.list || true
  # De-duplicate if the line already contained some components.
  sed -i 's/ contrib contrib/ contrib/g; s/ non-free-firmware non-free-firmware/ non-free-firmware/g; s/ non-free non-free/ non-free/g' /etc/apt/sources.list || true
fi

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

apt-get install -y --no-install-recommends \
  ca-certificates \
  console-setup \
  console-setup-linux \
  curl \
  firmware-atheros \
  firmware-brcm80211 \
  firmware-iwlwifi \
  firmware-linux \
  firmware-linux-nonfree \
  firmware-misc-nonfree \
  firmware-realtek \
  gnupg \
  jq \
  kbd \
  keyboard-configuration \
  network-manager \
  openssh-server \
  python3 \
  python3-yaml \
  xkb-data

log "Making console-setup optional on headless/serial systems..."
# On some VMs/serial-only installs, Debian's console-setup.service can fail noisily because
# there is no virtual console (/dev/tty0). Skipping the unit avoids a scary red [FAILED]
# without impacting SSH/headless usage.
install -d -m 0755 /etc/systemd/system/console-setup.service.d
cat >/etc/systemd/system/console-setup.service.d/5tratumos.conf <<'EOF'
[Unit]
ConditionPathExists=/dev/tty0
EOF

log "Setting default console keymap (UK) + UTF-8..."
if [ ! -f /etc/default/keyboard ]; then
  cat >/etc/default/keyboard <<'EOF'
# KEYBOARD CONFIGURATION FILE
XKBMODEL="pc105"
XKBLAYOUT="gb"
XKBVARIANT=""
XKBOPTIONS=""
BACKSPACE="guess"
EOF
fi
if [ ! -f /etc/default/console-setup ]; then
  cat >/etc/default/console-setup <<'EOF'
ACTIVE_CONSOLES="/dev/tty[1-6]"
CHARMAP="UTF-8"
CODESET="Lat15"
FONTFACE="Fixed"
FONTSIZE="16"
EOF
fi
setupcon --force >/dev/null 2>&1 || true

log "Installing kiosk packages (cage + chromium + X11 fallback)..."
# Wayland (cage) works best on bare metal with DRM.
# In VMs (Proxmox/qemu), Chromium often needs an X11 fallback via xinit+Xorg.
apt-get install -y --no-install-recommends \
  cage \
  chromium \
  matchbox-window-manager \
  x11-xserver-utils \
  xinit \
  xserver-xorg-core \
  xserver-xorg-input-libinput \
  xserver-xorg-legacy \
  xserver-xorg-video-fbdev \
  xserver-xorg-video-vesa \
  xserver-xorg-video-qxl

log "Enabling NetworkManager (for WiFi + robust DHCP)..."
SYSTEMD_OFFLINE=1 systemctl enable NetworkManager.service >/dev/null 2>&1 || true

log "Enabling SSH..."
# Provide SSH access on first boot so remote administration doesn't require console access.
# (Systemd isn't PID1 here, so enable offline.)
SYSTEMD_OFFLINE=1 systemctl enable ssh.service >/dev/null 2>&1 || SYSTEMD_OFFLINE=1 systemctl enable ssh >/dev/null 2>&1 || true

log "Installing Docker + Compose..."
if ! command -v docker >/dev/null 2>&1; then
  # On Debian 13, docker.io may not ship the `docker` client binary; install docker-cli too.
  apt-get install -y --no-install-recommends docker.io docker-cli containerd
fi

# Prefer Compose v2 plugin if available; fall back to docker-compose v1.
if ! docker compose version >/dev/null 2>&1 && apt-cache show docker-compose-plugin >/dev/null 2>&1; then
  apt-get install -y --no-install-recommends docker-compose-plugin || true
fi

if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1 && apt-cache show docker-compose >/dev/null 2>&1; then
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

# Optional: install a GitHub token from removable media (for private update repos).
# Safer than embedding it into update.json because it's stored in a dedicated 0600 file.
for tok in /cdrom/update.token /cdrom/5tratumos/update.token; do
  if [ -f "${tok}" ]; then
    install -m 0600 "${tok}" /etc/5tratumos/update.token || true
    break
  fi
done

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
if [ -f "${STAGE_DIR}/systemd/5tratumos-firstboot-update.service" ]; then
  install -m 0644 "${STAGE_DIR}/systemd/5tratumos-firstboot-update.service" /etc/systemd/system/5tratumos-firstboot-update.service
fi

# Install/enable kiosk console (best-effort; it self-gates on /dev/dri/card0).
if [ -d "${STAGE_DIR}/console" ] && [ -f "${STAGE_DIR}/console/5tratumos-console.sh" ] && [ -f "${STAGE_DIR}/console/5tratumos-console@.service" ]; then
  install -m 0755 "${STAGE_DIR}/console/5tratumos-console.sh" /usr/local/bin/5tratumos-console
  install -m 0644 "${STAGE_DIR}/console/5tratumos-console@.service" /etc/systemd/system/5tratumos-console@.service
  if [ -f "${STAGE_DIR}/console/5tratumos-x11-session.sh" ]; then
    install -d -m 0755 /usr/local/lib/5tratumos
    install -m 0755 "${STAGE_DIR}/console/5tratumos-x11-session.sh" /usr/local/lib/5tratumos/5tratumos-x11-session
  fi
  # Normalize CRLF line endings in case the bundle was built on Windows.
  sed -i 's/\r$//' /usr/local/bin/5tratumos-console /etc/systemd/system/5tratumos-console@.service /usr/local/lib/5tratumos/5tratumos-x11-session 2>/dev/null || true
  for grp in video input render; do
    if getent group "${grp}" >/dev/null 2>&1; then
      usermod -aG "${grp}" forge >/dev/null 2>&1 || true
    fi
  done
  SYSTEMD_OFFLINE=1 systemctl enable "5tratumos-console@forge.service" >/dev/null 2>&1 || true
fi

# Fallback for distros without docker compose plugin: use docker-compose if available.
if ! docker compose version >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
  sed -i 's#/usr/bin/docker compose#/usr/bin/docker-compose#g' /etc/systemd/system/5tratumos-overlay.service || true
fi

# systemctl inside installer chroot should run offline (systemd isn't PID1 yet).
SYSTEMD_OFFLINE=1 systemctl enable 5tratumosd.service 5tratumos-overlay.service 5tratumos-firstboot.service
if [ -f /etc/systemd/system/5tratumos-firstboot-update.service ]; then
  SYSTEMD_OFFLINE=1 systemctl enable 5tratumos-firstboot-update.service >/dev/null 2>&1 || true
fi

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
