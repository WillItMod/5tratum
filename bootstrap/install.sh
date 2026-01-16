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
install -d -m 0755 /opt/forgeos
rm -rf /opt/forgeos/overlay /opt/forgeos/apps-available /opt/forgeos/daemon /opt/forgeos/console
cp -a "${SRC_ROOT}/overlay" /opt/forgeos/overlay
cp -a "${SRC_ROOT}/apps-available" /opt/forgeos/apps-available
cp -a "${SRC_ROOT}/daemon" /opt/forgeos/daemon
cp -a "${SRC_ROOT}/console" /opt/forgeos/console
install -d -m 0755 /opt/forgeos/apps
install -d -m 0755 /var/lib/forgeos/apps

echo "[4/6] Installing forgeos CLI + systemd unit..."
install -m 0755 "${SRC_ROOT}/bin/forgeos" /usr/local/bin/forgeos

install -d -m 0755 /etc/forgeos
if [ ! -f /etc/forgeos/channel ]; then
  echo "main" >/etc/forgeos/channel
fi

install -m 0644 "${SRC_ROOT}/systemd/forgeos-overlay.service" /etc/systemd/system/forgeos-overlay.service
install -m 0644 "${SRC_ROOT}/systemd/forgeosd.service" /etc/systemd/system/forgeosd.service
systemctl daemon-reload
systemctl enable --now forgeosd.service
systemctl enable --now forgeos-overlay.service

echo "[5/6] Syncing WillItMod app store (optional)..."
if /usr/local/bin/forgeos store sync >/dev/null 2>&1; then
  echo "Store synced."
else
  echo "warn: store sync failed (run: sudo forgeos store sync)" >&2
fi

echo "[6/6] Done."
echo "Overlay: http://<host>:80"
echo "Next: sudo forgeos app install axelive && sudo forgeos app up axelive"
