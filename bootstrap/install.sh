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

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SRC_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

echo "[1/6] Installing base packages..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  gnupg \
  jq \
  python3 \
  python3-yaml

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

echo "[6/7] Syncing Global App Store (optional)..."
if /usr/local/bin/5tratumos store sync >/dev/null 2>&1; then
  echo "Store synced."
else
  echo "warn: store sync failed (run: sudo 5tratumos store sync)" >&2
fi

echo "[7/7] Done."
echo "Overlay: http://<host>:80"
echo "Next: sudo 5tratumos app install axelive && sudo 5tratumos app up axelive"
