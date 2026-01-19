#!/usr/bin/env bash
set -euo pipefail

die() { echo "error: $*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

DEBIAN_ISO_URL_DEFAULT="https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-13.3.0-amd64-netinst.iso"
DEBIAN_ISO="${DEBIAN_ISO:-${SCRIPT_DIR}/debian-netinst.iso}"
DEBIAN_ISO_URL="${DEBIAN_ISO_URL:-${DEBIAN_ISO_URL_DEFAULT}}"

BUNDLE_TGZ="${BUNDLE_TGZ:-${ROOT}/dist/5tratumos-update.tgz}"
OUT_ISO="${OUT_ISO:-${ROOT}/dist/5tratumos-installer.iso}"
WORK_DIR="${WORK_DIR:-${SCRIPT_DIR}/work-preseed}"

have bsdtar || die "bsdtar not found"
have xorriso || die "xorriso not found (apt-get install -y xorriso)"

if [ ! -f "${BUNDLE_TGZ}" ]; then
  die "Missing bundle: ${BUNDLE_TGZ}. Build it via ./scripts/build-update-bundle.sh (or .ps1 on Windows)."
fi

mkdir -p "$(dirname -- "${OUT_ISO}")"

if [ ! -f "${DEBIAN_ISO}" ]; then
  echo "[1/6] Downloading Debian netinst ISO..."
  curl -fL --retry 3 --retry-delay 2 -o "${DEBIAN_ISO}" "${DEBIAN_ISO_URL}"
fi

echo "[2/6] Extracting ISO..."
rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}/iso"
bsdtar -C "${WORK_DIR}/iso" -xf "${DEBIAN_ISO}"

echo "[3/6] Adding 5tratumOS installer files..."
install -d -m 0755 "${WORK_DIR}/iso/5tratumos"
install -m 0644 "${SCRIPT_DIR}/debian-installer/preseed.cfg" "${WORK_DIR}/iso/preseed.cfg"
install -m 0755 "${SCRIPT_DIR}/debian-installer/late_command.sh" "${WORK_DIR}/iso/5tratumos/late_command.sh"
install -m 0644 "${BUNDLE_TGZ}" "${WORK_DIR}/iso/5tratumos/5tratumos-update.tgz"

echo "[4/6] Patching boot configs to use preseed..."
append_args="auto=true priority=critical preseed/file=/cdrom/preseed.cfg"

# BIOS (isolinux)
if [ -f "${WORK_DIR}/iso/isolinux/txt.cfg" ]; then
  awk -v args="${append_args}" '
    BEGIN { OFS=""; }
    /^[[:space:]]*append[[:space:]]/ {
      line=$0
      sub(/^[[:space:]]*append[[:space:]]+/, "", line)
      split(line, parts, /[[:space:]]+---[[:space:]]+/)
      if (length(parts) > 1) {
        print "  append ", args, " ", parts[1], " --- ", parts[2]
      } else {
        print "  append ", args, " ", line
      }
      next
    }
    { print $0 }
  ' "${WORK_DIR}/iso/isolinux/txt.cfg" >"${WORK_DIR}/iso/isolinux/txt.cfg.tmp"
  mv "${WORK_DIR}/iso/isolinux/txt.cfg.tmp" "${WORK_DIR}/iso/isolinux/txt.cfg"
fi
if [ -f "${WORK_DIR}/iso/isolinux/isolinux.cfg" ]; then
  sed -i "s/^default .*/default install/" "${WORK_DIR}/iso/isolinux/isolinux.cfg" || true
  sed -i "s/^timeout .*/timeout 30/" "${WORK_DIR}/iso/isolinux/isolinux.cfg" || true
fi

# UEFI (grub)
if [ -f "${WORK_DIR}/iso/boot/grub/grub.cfg" ]; then
  sed -i "s#\\(linux\\s\\+/install\\.amd/vmlinuz\\s\\+\\)#\\1${append_args} #g" "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
  sed -i "s/^set timeout=.*/set timeout=3/" "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
fi

echo "[5/6] Updating md5sum.txt (if present)..."
if [ -f "${WORK_DIR}/iso/md5sum.txt" ]; then
  (cd "${WORK_DIR}/iso" && find . -type f ! -name md5sum.txt -print0 | xargs -0 md5sum > md5sum.txt)
fi

echo "[6/6] Building ISO..."
isolinux_bin="isolinux/isolinux.bin"
boot_cat="isolinux/boot.cat"

efi_img=""
if [ -f "${WORK_DIR}/iso/boot/grub/efi.img" ]; then
  efi_img="boot/grub/efi.img"
elif [ -f "${WORK_DIR}/iso/efi.img" ]; then
  efi_img="efi.img"
else
  die "Unable to find efi.img in extracted ISO"
fi

mbr=""
for p in /usr/lib/ISOLINUX/isohdpfx.bin /usr/lib/syslinux/isohdpfx.bin /usr/lib/syslinux/bios/isohdpfx.bin; do
  if [ -f "$p" ]; then
    mbr="$p"
    break
  fi
done
if [ -z "${mbr}" ]; then
  die "Unable to find isohdpfx.bin (install syslinux-common/syslinux-utils)"
fi

VOLID="5TRATUMOS_INSTALLER"

xorriso -as mkisofs \
  -o "${OUT_ISO}" \
  -V "${VOLID}" \
  -r -J -joliet-long \
  -isohybrid-mbr "${mbr}" \
  -partition_offset 16 \
  -b "${isolinux_bin}" \
  -c "${boot_cat}" \
  -no-emul-boot \
  -boot-load-size 4 \
  -boot-info-table \
  -eltorito-alt-boot \
  -e "${efi_img}" \
  -no-emul-boot \
  -isohybrid-gpt-basdat \
  "${WORK_DIR}/iso"

echo "Wrote:"
echo "  ${OUT_ISO}"

