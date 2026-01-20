#!/usr/bin/env bash
set -euo pipefail

die() { echo "error: $*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }
have_imagemagick_convert() {
  command -v convert >/dev/null 2>&1 || return 1
  convert -version 2>/dev/null | grep -qi 'ImageMagick' || return 1
  return 0
}

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

DEBIAN_ISO_URL_DEFAULT="https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-13.3.0-amd64-netinst.iso"
DEBIAN_ISO="${DEBIAN_ISO:-${SCRIPT_DIR}/debian-netinst.iso}"
DEBIAN_ISO_URL="${DEBIAN_ISO_URL:-${DEBIAN_ISO_URL_DEFAULT}}"

BUNDLE_TGZ="${BUNDLE_TGZ:-${ROOT}/dist/5tratumos-update.tgz}"
OUT_ISO="${OUT_ISO:-${ROOT}/dist/5tratumos-installer.iso}"
WORK_DIR="${WORK_DIR:-${SCRIPT_DIR}/work-preseed}"

LOGO_SMALL="${LOGO_SMALL:-${ROOT}/overlay/portal/assets/New Logos/5.png}"
LOGO_WORDMARK="${LOGO_WORDMARK:-${ROOT}/overlay/portal/assets/New Logos/WordOnlyLogo.png}"

# Optional: embed an update token on the ISO for private update repos.
# Provide a filepath at build time (do not commit secrets to git):
#   UPDATE_TOKEN_FILE=/path/to/update.token ./installer/build-debian-preseed-iso.sh
UPDATE_TOKEN_FILE="${UPDATE_TOKEN_FILE:-}"

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
# Debian netinst ISO contains a root-level RockRidge symlink named "debian" which can
# cause extraction failures on some filesystems/environments (e.g. MSYS2 on Windows).
# It isn't required for booting or installation.
bsdtar -C "${WORK_DIR}/iso" -xf "${DEBIAN_ISO}" --exclude debian
chmod -R u+w "${WORK_DIR}/iso" >/dev/null 2>&1 || true

echo "[3/6] Adding 5tratumOS installer files..."
install -d -m 0755 "${WORK_DIR}/iso/5tratumos"
install -d -m 0755 "${WORK_DIR}/iso/5tratumos/branding"
install -m 0644 "${SCRIPT_DIR}/debian-installer/preseed.cfg" "${WORK_DIR}/iso/preseed.cfg"
install -m 0755 "${SCRIPT_DIR}/debian-installer/late_command.sh" "${WORK_DIR}/iso/5tratumos/late_command.sh"
install -m 0644 "${BUNDLE_TGZ}" "${WORK_DIR}/iso/5tratumos/5tratumos-update.tgz"
if [ -n "${UPDATE_TOKEN_FILE}" ] && [ -f "${UPDATE_TOKEN_FILE}" ]; then
  install -m 0644 "${UPDATE_TOKEN_FILE}" "${WORK_DIR}/iso/5tratumos/update.token"
fi

if [ -f "${LOGO_SMALL}" ]; then
  install -m 0644 "${LOGO_SMALL}" "${WORK_DIR}/iso/5tratumos/branding/5.png"
fi
if [ -f "${LOGO_WORDMARK}" ]; then
  install -m 0644 "${LOGO_WORDMARK}" "${WORK_DIR}/iso/5tratumos/branding/WordOnlyLogo.png"
fi

echo "[4/6] Branding + preseed boot configs..."
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
if [ -d "${WORK_DIR}/iso/isolinux" ]; then
  for f in "${WORK_DIR}/iso/isolinux/"*.cfg; do
    [ -f "$f" ] || continue
    sed -i 's/Debian GNU\/Linux installer menu/5tratumOS Installer/g' "$f" || true
    sed -i 's/Debian Installer/5tratumOS Installer/g' "$f" || true
    sed -i 's/Debian installer/5tratumOS installer/g' "$f" || true
  done
fi

# Optional: generate a Syslinux splash background (requires ImageMagick's `convert`).
if [ -d "${WORK_DIR}/iso/isolinux" ] && have_imagemagick_convert; then
  if [ -f "${WORK_DIR}/iso/5tratumos/branding/WordOnlyLogo.png" ]; then
    tmp_splash="${WORK_DIR}/iso/isolinux/splash.png"
    convert -size 640x480 xc:'#07090e' \
      "${WORK_DIR}/iso/5tratumos/branding/WordOnlyLogo.png" -resize 520x -gravity north -geometry +0+60 -composite \
      "${WORK_DIR}/iso/5tratumos/branding/5.png" -resize 90x -gravity northeast -geometry +36+24 -composite \
      "${tmp_splash}" || true
  fi
fi

# UEFI (grub)
if [ -f "${WORK_DIR}/iso/boot/grub/grub.cfg" ]; then
  sed -i "s#\\(linux\\s\\+/install\\.amd/vmlinuz\\s\\+\\)#\\1${append_args} #g" "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
  sed -i "s/^set timeout=.*/set timeout=3/" "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
fi
if [ -f "${WORK_DIR}/iso/boot/grub/grub.cfg" ]; then
  sed -i 's/Debian GNU\/Linux installer menu/5tratumOS Installer/g' "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
  sed -i 's/Debian Installer/5tratumOS Installer/g' "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
  sed -i 's/Debian installer/5tratumOS installer/g' "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
fi

# Optional: Grub background (requires ImageMagick's `convert`).
if have_imagemagick_convert; then
  if [ -f "${WORK_DIR}/iso/5tratumos/branding/WordOnlyLogo.png" ]; then
    bg="${WORK_DIR}/iso/boot/grub/background.png"
    convert -size 1024x768 xc:'#07090e' \
      "${WORK_DIR}/iso/5tratumos/branding/WordOnlyLogo.png" -resize 820x -gravity center -geometry +0-40 -composite \
      "${WORK_DIR}/iso/5tratumos/branding/5.png" -resize 120x -gravity southeast -geometry +40+40 -composite \
      "${bg}" || true
    if [ -f "${bg}" ]; then
      if ! grep -q 'background_image' "${WORK_DIR}/iso/boot/grub/grub.cfg"; then
        sed -i "1i\\insmod png\\nbackground_image -m stretch /boot/grub/background.png\\n" "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
      fi
    fi
  fi
fi

echo "[5/6] Updating md5sum.txt (if present)..."
if [ -f "${WORK_DIR}/iso/md5sum.txt" ]; then
  chmod u+w "${WORK_DIR}/iso/md5sum.txt" >/dev/null 2>&1 || true
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
  echo "warn: isohdpfx.bin not found; attempting to download syslinux-common to extract it..." >&2
  pkg_dir="${WORK_DIR}/pkg"
  rm -rf "${pkg_dir}"
  mkdir -p "${pkg_dir}"
  if command -v apt-get >/dev/null 2>&1; then
    (
      cd "${pkg_dir}"
      apt-get update -y >/dev/null 2>&1 || true
      apt-get download isolinux >/dev/null 2>&1 || true
      apt-get download syslinux-common >/dev/null 2>&1 || true
    )
    deb="$(ls -1 "${pkg_dir}"/isolinux_*.deb 2>/dev/null | head -n 1 || true)"
    if [ -z "${deb}" ]; then
      deb="$(ls -1 "${pkg_dir}"/syslinux-common_*.deb 2>/dev/null | head -n 1 || true)"
    fi
    if [ -n "${deb}" ] && command -v dpkg-deb >/dev/null 2>&1; then
      dpkg-deb -x "${deb}" "${pkg_dir}/extract" >/dev/null 2>&1 || true
      for p in "${pkg_dir}/extract/usr/lib/ISOLINUX/isohdpfx.bin" "${pkg_dir}/extract/usr/lib/syslinux/isohdpfx.bin"; do
        if [ -f "${p}" ]; then
          mbr="${p}"
          break
        fi
      done
    fi
  fi
fi

VOLID="5TRATUMOS_INSTALLER"

mbr_arg="${mbr}"
if [ -z "${mbr_arg}" ]; then
  # xorriso can take the isohybrid MBR from an existing ISO (no syslinux package needed).
  mbr_arg="--interval:local_fs:0s-15s:zero_mbrpt,zero_gpt,zero_apm:${DEBIAN_ISO}"
  echo "warn: isohdpfx.bin not found; using MBR from: ${DEBIAN_ISO}" >&2
fi

rm -f "${OUT_ISO}" >/dev/null 2>&1 || true

xorriso -as mkisofs \
  -o "${OUT_ISO}" \
  -V "${VOLID}" \
  -r -J -joliet-long \
  -isohybrid-mbr "${mbr_arg}" \
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
