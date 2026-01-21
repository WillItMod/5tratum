#!/usr/bin/env bash
set -euo pipefail

die() { echo "error: $*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

# Base Raspberry Pi OS Lite image (arm64) provided as an .img.xz.
BASE_IMG_XZ="${BASE_IMG_XZ:-}"

# 5tratumOS update bundle to embed for first-boot install.
BUNDLE_TGZ="${BUNDLE_TGZ:-${ROOT}/dist/5tratumos-update.tgz}"

# Optional: embed update token on the boot partition (not used for stores).
# Provide a filepath at build time (do not commit secrets to git):
#   UPDATE_TOKEN_FILE=/path/to/update.token BASE_IMG_XZ=... ./installer/build-raspios-image.sh
UPDATE_TOKEN_FILE="${UPDATE_TOKEN_FILE:-}"

# Output image.
OUT_IMG_XZ="${OUT_IMG_XZ:-${ROOT}/dist/5tratumos-raspios-lite.img.xz}"

# Work directory (large; use a fast disk).
WORK_DIR="${WORK_DIR:-${SCRIPT_DIR}/work-raspios}"

TRATUMOS_UPDATE_REPO="${TRATUMOS_UPDATE_REPO:-WillItMod/5tratum}"
TRATUMOS_CHANNEL="${TRATUMOS_CHANNEL:-main}"
TRATUMOS_TAG="${TRATUMOS_TAG:-}"
if [ -z "${TRATUMOS_TAG}" ] && have git; then
  TRATUMOS_TAG="$(git -C "${ROOT}" describe --tags --always 2>/dev/null || true)"
fi
TRATUMOS_TAG="${TRATUMOS_TAG:-unknown}"

[ -n "${BASE_IMG_XZ}" ] || die "BASE_IMG_XZ is required (path to raspios *.img.xz)"
[ -f "${BASE_IMG_XZ}" ] || die "BASE_IMG_XZ not found: ${BASE_IMG_XZ}"
[ -f "${BUNDLE_TGZ}" ] || die "Missing bundle: ${BUNDLE_TGZ}. Build it via ./scripts/build-update-bundle.sh"

have xz || die "xz not found"
have losetup || die "losetup not found"
have mount || die "mount not found"
have umount || die "umount not found"
have sha256sum || die "sha256sum not found"

mkdir -p "$(dirname -- "${OUT_IMG_XZ}")"

rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}"

img="${WORK_DIR}/image.img"
mnt_root="${WORK_DIR}/mnt-root"
mnt_boot="${WORK_DIR}/mnt-boot"
mkdir -p "${mnt_root}" "${mnt_boot}"

echo "[1/6] Extracting base image..."
xz -dc "${BASE_IMG_XZ}" >"${img}"

loop=""
cleanup() {
  set +e
  sync >/dev/null 2>&1 || true
  umount "${mnt_boot}" >/dev/null 2>&1 || true
  umount "${mnt_root}" >/dev/null 2>&1 || true
  [ -n "${loop}" ] && losetup -d "${loop}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "[2/6] Attaching loop device..."
loop="$(losetup --show -fP "${img}")"

boot_dev="${loop}p1"
root_dev="${loop}p2"
[ -b "${boot_dev}" ] || die "boot partition not found: ${boot_dev}"
[ -b "${root_dev}" ] || die "root partition not found: ${root_dev}"

echo "[3/6] Mounting partitions..."
mount "${root_dev}" "${mnt_root}"
mount "${boot_dev}" "${mnt_boot}"

echo "[4/6] Embedding 5tratumOS bundle + firstboot installer..."

# Place bundle on the boot partition so it's easy to find and verify on first boot.
install -m 0644 "${BUNDLE_TGZ}" "${mnt_boot}/5tratumos-update.tgz"
bundle_sha="$(sha256sum "${BUNDLE_TGZ}" | awk '{print $1}')"
printf '%s  %s\n' "${bundle_sha}" "5tratumos-update.tgz" >"${mnt_boot}/5tratumos-update.tgz.sha256"
chmod 0644 "${mnt_boot}/5tratumos-update.tgz.sha256"

if [ -n "${UPDATE_TOKEN_FILE}" ] && [ -f "${UPDATE_TOKEN_FILE}" ]; then
  install -m 0600 "${UPDATE_TOKEN_FILE}" "${mnt_boot}/update.token"
fi

# Ship the one-shot installer script (runs on the Pi).
install -d -m 0755 "${mnt_root}/usr/local/sbin"
install -m 0755 "${ROOT}/scripts/install-rpi.sh" "${mnt_root}/usr/local/sbin/5tratumos-install-rpi"

cat >"${mnt_root}/usr/local/sbin/5tratumos-rpi-firstboot-install" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="/var/log/5tratumos-rpi-firstboot-install.log"
mkdir -p "$(dirname -- "${LOG_FILE}")"
exec > >(tee -a "${LOG_FILE}") 2>&1

DONE_FILE="/var/lib/5tratumos/rpi-firstboot.done"
if [ -f "${DONE_FILE}" ]; then
  exit 0
fi

TRATUMOS_TAG_DEFAULT="__TRATUMOS_TAG__"
TRATUMOS_UPDATE_REPO_DEFAULT="__TRATUMOS_UPDATE_REPO__"
TRATUMOS_CHANNEL_DEFAULT="__TRATUMOS_CHANNEL__"

TRATUMOS_TAG="${TRATUMOS_TAG:-${TRATUMOS_TAG_DEFAULT}}"
TRATUMOS_UPDATE_REPO="${TRATUMOS_UPDATE_REPO:-${TRATUMOS_UPDATE_REPO_DEFAULT}}"
TRATUMOS_CHANNEL="${TRATUMOS_CHANNEL:-${TRATUMOS_CHANNEL_DEFAULT}}"

echo "[firstboot] tag=${TRATUMOS_TAG} repo=${TRATUMOS_UPDATE_REPO} channel=${TRATUMOS_CHANNEL}"

boot_dir="/boot/firmware"
if [ ! -f "${boot_dir}/5tratumos-update.tgz" ]; then
  boot_dir="/boot"
fi
bundle="${boot_dir}/5tratumos-update.tgz"
sha="${boot_dir}/5tratumos-update.tgz.sha256"
tok="${boot_dir}/update.token"

if [ ! -f "${bundle}" ]; then
  echo "[firstboot] missing bundle: ${bundle}" >&2
  exit 1
fi

# Give the OS resize services time to finish on first boot.
sleep 5

# Wait for enough free space (auto-resize may still be running).
min_kb="${TRATUMOS_RPI_MIN_FREE_KB:-1000000}" # ~1GB
for _ in $(seq 1 120); do
  free_kb="$(df -Pk / | awk 'NR==2{print $4}' || true)"
  free_kb="${free_kb:-0}"
  if [ "${free_kb}" -ge "${min_kb}" ]; then
    break
  fi
  sleep 2
done

echo "[firstboot] installing 5tratumOS..."
bundle_url="file://${bundle}"

export CHANNEL="${TRATUMOS_CHANNEL}"
export INSTALL_REPO="${TRATUMOS_UPDATE_REPO}"
export BUNDLE_URL="${bundle_url}"

if [ -f "${tok}" ]; then
  export UPDATE_TOKEN="$(head -n 1 "${tok}" 2>/dev/null | tr -d '\r\n' | cut -c1-4096)"
fi

/usr/local/sbin/5tratumos-install-rpi

echo "[firstboot] stamping build info..."
install -d -m 0755 /etc/5tratumos
installed_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
cat >/etc/5tratumos/build.json <<JSON
{"tag":"${TRATUMOS_TAG}","repo":"${TRATUMOS_UPDATE_REPO}","channel":"${TRATUMOS_CHANNEL}","installed_at":"${installed_at}"}
JSON

echo "[firstboot] enabling kiosk..."
if [ -x /opt/5tratumos/console/install.sh ]; then
  bash /opt/5tratumos/console/install.sh
fi

install -d -m 0755 "$(dirname -- "${DONE_FILE}")"
touch "${DONE_FILE}"

# Best-effort: remove token from the boot partition after seeding.
rm -f "${tok}" >/dev/null 2>&1 || true

echo "[firstboot] done; rebooting..."
systemctl reboot
EOF

# Substitute build metadata into the firstboot script without leaking secrets.
sed -i \
  -e "s|__TRATUMOS_TAG__|${TRATUMOS_TAG}|g" \
  -e "s|__TRATUMOS_UPDATE_REPO__|${TRATUMOS_UPDATE_REPO}|g" \
  -e "s|__TRATUMOS_CHANNEL__|${TRATUMOS_CHANNEL}|g" \
  "${mnt_root}/usr/local/sbin/5tratumos-rpi-firstboot-install"
chmod 0755 "${mnt_root}/usr/local/sbin/5tratumos-rpi-firstboot-install"

cat >"${mnt_root}/etc/systemd/system/5tratumos-rpi-firstboot-install.service" <<'EOF'
[Unit]
Description=5tratumOS RPi first boot installer
Wants=network-online.target
After=network-online.target
After=rpi-resize.service systemd-growfs-root.service
ConditionPathExists=!/var/lib/5tratumos/rpi-firstboot.done

[Service]
Type=oneshot
ExecStart=/usr/local/sbin/5tratumos-rpi-firstboot-install
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

mkdir -p "${mnt_root}/etc/systemd/system/multi-user.target.wants"
ln -sf ../5tratumos-rpi-firstboot-install.service \
  "${mnt_root}/etc/systemd/system/multi-user.target.wants/5tratumos-rpi-firstboot-install.service"

echo "[5/6] Sync + detach..."
sync

echo "[6/6] Compressing image..."
rm -f "${OUT_IMG_XZ}" >/dev/null 2>&1 || true
xz -T0 -z -c "${img}" >"${OUT_IMG_XZ}"
sha256sum "${OUT_IMG_XZ}" >"${OUT_IMG_XZ}.sha256"

echo "Wrote:"
echo "  ${OUT_IMG_XZ}"
echo "  ${OUT_IMG_XZ}.sha256"
