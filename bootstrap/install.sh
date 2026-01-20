#!/usr/bin/env bash
set -euo pipefail

die() {
  echo "error: $*" >&2
  exit 1
}

have() { command -v "$1" >/dev/null 2>&1; }

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  die "run as root (try: sudo $0)"
fi

CONSOLE_USER="${FIVETRATUMOS_CONSOLE_USER:-${TRATUMOS_CONSOLE_USER:-forge}}"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SRC_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

echo "[1/6] Installing base packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
  ca-certificates \
  console-setup \
  console-setup-linux \
  curl \
  cloud-guest-utils \
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
  python3 \
  python3-yaml

echo "[2.5/7] Avoiding console-setup failure on headless systems..."
install -d -m 0755 /etc/systemd/system/console-setup.service.d
cat >/etc/systemd/system/console-setup.service.d/5tratumos.conf <<'EOF'
[Unit]
ConditionPathExists=/dev/tty0
EOF

echo "[2.6/7] Setting default console keymap (UK) + UTF-8..."
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

echo "[2.7/7] Enabling NetworkManager..."
systemctl enable --now NetworkManager.service >/dev/null 2>&1 || true

if ! have docker; then
  echo "[2/6] Installing Docker Engine + Compose v2..."
  install -d -m 0755 /etc/apt/keyrings
  if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    . /etc/os-release
    case "${ID}" in
      ubuntu|debian) ;;
      *) die "unsupported distro for automatic Docker install: ${ID} (expected ubuntu/debian)" ;;
    esac
    curl -fsSL "https://download.docker.com/linux/${ID}/gpg" | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
  fi

  . /etc/os-release
  arch="$(dpkg --print-architecture)"
  codename="${VERSION_CODENAME}"
  echo "deb [arch=${arch} signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${ID} ${codename} stable" \
    >/etc/apt/sources.list.d/docker.list

  apt-get update -y
  apt-get install -y --no-install-recommends \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

  if id -u forge >/dev/null 2>&1; then
    usermod -aG docker forge || true
  fi
else
  echo "[2/6] Docker already installed; skipping."
fi

echo "[3/6] Installing kiosk packages (cage + chromium)..."
apt-get install -y --no-install-recommends cage chromium || true

echo "[3/6] Installing 5tratumOS overlay + AxeSuite templates..."
install -d -m 0755 /opt/5tratumos
rm -rf /opt/5tratumos/overlay /opt/5tratumos/apps-available /opt/5tratumos/daemon /opt/5tratumos/console
cp -a "${SRC_ROOT}/overlay" /opt/5tratumos/overlay
cp -a "${SRC_ROOT}/apps-available" /opt/5tratumos/apps-available
cp -a "${SRC_ROOT}/daemon" /opt/5tratumos/daemon
cp -a "${SRC_ROOT}/console" /opt/5tratumos/console
cp -a "${SRC_ROOT}/bootstrap" /opt/5tratumos/bootstrap
install -d -m 0755 /opt/5tratumos/apps
install -d -m 0755 /var/lib/5tratumos/apps

echo "[4/6] Installing 5tratumos CLI + systemd unit..."
install -m 0755 "${SRC_ROOT}/bin/5tratumos" /usr/local/bin/5tratumos

install -d -m 0755 /etc/5tratumos
if [ ! -f /etc/5tratumos/channel ]; then
  echo "main" >/etc/5tratumos/channel
fi

install -m 0644 "${SRC_ROOT}/systemd/5tratumos-overlay.service" /etc/systemd/system/5tratumos-overlay.service
install -m 0644 "${SRC_ROOT}/systemd/5tratumosd.service" /etc/systemd/system/5tratumosd.service
install -m 0644 "${SRC_ROOT}/systemd/5tratumos-firstboot.service" /etc/systemd/system/5tratumos-firstboot.service

if [ -f "${SRC_ROOT}/console/5tratumos-console.sh" ] && [ -f "${SRC_ROOT}/console/5tratumos-console@.service" ]; then
  install -m 0755 "${SRC_ROOT}/console/5tratumos-console.sh" /usr/local/bin/5tratumos-console
  install -m 0644 "${SRC_ROOT}/console/5tratumos-console@.service" /etc/systemd/system/5tratumos-console@.service
  for grp in video input render; do
    if getent group "${grp}" >/dev/null 2>&1; then
      usermod -aG "${grp}" "${CONSOLE_USER}" >/dev/null 2>&1 || true
    fi
  done
  systemctl enable --now "5tratumos-console@${CONSOLE_USER}.service" || true
fi

systemctl daemon-reload
systemctl enable --now 5tratumosd.service
systemctl enable --now 5tratumos-overlay.service
systemctl enable --now 5tratumos-firstboot.service

echo "[5/7] Disabling sleep/suspend..."
install -d -m 0755 /etc/systemd/logind.conf.d
cat >/etc/systemd/logind.conf.d/5tratumos.conf <<'EOF'
[Login]
IdleAction=ignore
IdleActionSec=0
HandleLidSwitch=ignore
HandleLidSwitchExternalPower=ignore
HandleLidSwitchDocked=ignore
EOF
systemctl restart systemd-logind || true
systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target || true

echo "[6/7] Global App Store (optional)..."
if [ "${FIVETRATUMOS_SYNC_GLOBAL_STORE:-0}" = "1" ]; then
  echo "Syncing Global App Store..."
  if /usr/local/bin/5tratumos store sync >/dev/null 2>&1; then
    echo "Store synced."
  else
    echo "warn: store sync failed (run: sudo 5tratumos store sync)" >&2
  fi
else
  echo "Skipping global store sync."
  echo "To sync later, run: sudo 5tratumos store sync"
  echo "To auto-sync during install, re-run with: FIVETRATUMOS_SYNC_GLOBAL_STORE=1"
fi

echo "[7/7] Done."
echo "Overlay: http://<host>:80"
echo "Next: sudo 5tratumos app install axelive && sudo 5tratumos app up axelive"
