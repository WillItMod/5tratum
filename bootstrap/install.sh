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
  curl \
  cloud-guest-utils \
  gnupg \
  jq \
  python3 \
  python3-yaml

echo "[2.5/7] Avoiding console-setup failure on headless systems..."
install -d -m 0755 /etc/systemd/system/console-setup.service.d
cat >/etc/systemd/system/console-setup.service.d/5tratumos.conf <<'EOF'
[Unit]
ConditionPathExists=/dev/tty0
EOF

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
install -m 0644 "${SRC_ROOT}/systemd/5tratumos-firstboot-update.service" /etc/systemd/system/5tratumos-firstboot-update.service

if [ -f "${SRC_ROOT}/console/5tratumos-console.sh" ] && [ -f "${SRC_ROOT}/console/5tratumos-console@.service" ]; then
  if have sed; then
    sed -i 's/\r$//' "${SRC_ROOT}/console/"*.sh >/dev/null 2>&1 || true
  fi
  install -m 0755 "${SRC_ROOT}/console/5tratumos-console.sh" /usr/local/bin/5tratumos-console
  if [ -f "${SRC_ROOT}/console/5tratumos-console-vt-switch.sh" ]; then
    install -m 0755 "${SRC_ROOT}/console/5tratumos-console-vt-switch.sh" /usr/local/bin/5tratumos-console-vt-switch
  fi
  install -m 0644 "${SRC_ROOT}/console/5tratumos-console@.service" /etc/systemd/system/5tratumos-console@.service
  for grp in video input render; do
    if getent group "${grp}" >/dev/null 2>&1; then
      usermod -aG "${grp}" "${CONSOLE_USER}" >/dev/null 2>&1 || true
    fi
  done
  systemctl enable --now "5tratumos-console@${CONSOLE_USER}.service" || true
fi

cat >/etc/issue <<'EOF'
5tratumOS local console (\l)

If the kiosk UI is not visible:
  - Switch to kiosk: Ctrl+Alt+F7 (or Fn+Ctrl+Alt+F7)
  - Back to this console: Ctrl+Alt+F1

TTY switching requires a physical keyboard/monitor.
Remote users: use the WebUI/SSH (a browser cannot switch TTYs).
EOF
cp -f /etc/issue /etc/issue.net >/dev/null 2>&1 || true

systemctl daemon-reload
systemctl enable --now 5tratumosd.service
systemctl enable --now 5tratumos-overlay.service
systemctl enable --now 5tratumos-firstboot.service
systemctl enable 5tratumos-firstboot-update.service >/dev/null 2>&1 || true

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
