#!/usr/bin/env bash
set -euo pipefail

die() { echo "error: $*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
BUILD_DIR="${BUILD_DIR:-${SCRIPT_DIR}/live-build}"
OUT_ISO="${OUT_ISO:-${ROOT}/dist/5tratumos-installer.iso}"

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  die "run as root (live-build uses chroot): sudo $0"
fi

have lb || die "live-build (lb) not found. On Debian: apt-get install -y live-build"

mkdir -p "${ROOT}/dist"

rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"

echo "[1/4] Configuring live-build..."
(
  cd "${BUILD_DIR}"
  lb config \
    --mode debian \
    --distribution trixie \
    --architectures amd64 \
    --binary-images iso-hybrid \
    --debian-installer false \
    --archive-areas "main contrib non-free-firmware" \
    --bootappend-live "boot=live components quiet"
)

echo "[2/4] Writing installer customizations..."
mkdir -p "${BUILD_DIR}/config/package-lists"
cat >"${BUILD_DIR}/config/package-lists/5tratumos-installer.list.chroot" <<'EOF'
dialog
debootstrap
debian-archive-keyring
gdisk
parted
util-linux
e2fsprogs
dosfstools
xz-utils
zstd
coreutils
ca-certificates
curl
gnupg
EOF

mkdir -p "${BUILD_DIR}/config/includes.chroot/usr/local/sbin"
install -m 0755 "${SCRIPT_DIR}/files/5tratumos-installer" "${BUILD_DIR}/config/includes.chroot/usr/local/sbin/5tratumos-installer"

mkdir -p "${BUILD_DIR}/config/includes.chroot/etc/systemd/system"
install -m 0644 "${SCRIPT_DIR}/files/5tratumos-installer.service" "${BUILD_DIR}/config/includes.chroot/etc/systemd/system/5tratumos-installer.service"
mkdir -p "${BUILD_DIR}/config/hooks/normal"
cat >"${BUILD_DIR}/config/hooks/normal/010-enable-installer.hook.chroot" <<'EOF'
#!/bin/sh
set -e
systemctl enable 5tratumos-installer.service
EOF
chmod +x "${BUILD_DIR}/config/hooks/normal/010-enable-installer.hook.chroot"

echo "Note: this installer ISO performs a fresh install (Debian + 5tratumOS) and does not embed a disk image."

echo "[3/4] Building ISO..."
(
  cd "${BUILD_DIR}"
  lb build
)

iso="$(ls -1 "${BUILD_DIR}"/*.iso 2>/dev/null | head -n 1 || true)"
[ -n "${iso}" ] || die "live-build did not produce an ISO"

echo "[4/4] Writing output: ${OUT_ISO}"
cp -f "${iso}" "${OUT_ISO}"

echo "Done:"
echo "  ${OUT_ISO}"
