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
OS_TAG="${OS_TAG:-${TRATUMOS_TAG:-${FIVETRATUMOS_TAG:-}}}"
OS_CHANNEL="${OS_CHANNEL:-main}"
UPDATE_TOKEN_FILE="${UPDATE_TOKEN_FILE:-${TRATUMOS_UPDATE_TOKEN_FILE:-${FIVETRATUMOS_UPDATE_TOKEN_FILE:-}}}"
BOOT_MODE="${BOOT_MODE:-hybrid}" # hybrid|uefi|bios

LOGO_SMALL="${LOGO_SMALL:-${ROOT}/overlay/portal/assets/New Logos/5.png}"
LOGO_WORDMARK="${LOGO_WORDMARK:-${ROOT}/overlay/portal/assets/New Logos/WordOnlyLogo.png}"

# Optional: embed an update token on the ISO for private update repos.
# Provide a filepath at build time (do not commit secrets to git):
#   UPDATE_TOKEN_FILE=/path/to/update.token ./installer/build-debian-preseed-iso.sh
# (For convenience, the auto-detect also accepts `update_token` as a source filename.)
UPDATE_TOKEN_FILE="${UPDATE_TOKEN_FILE:-}"

# If no explicit token path was provided, look for common local locations.
if [ -z "${UPDATE_TOKEN_FILE}" ]; then
  for candidate in \
    "${ROOT}/update.token" \
    "${ROOT}/update_token" \
    "${SCRIPT_DIR}/update.token" \
    "${SCRIPT_DIR}/update_token" \
    "${HOME:-}/update.token" \
    "${HOME:-}/update_token" \
    "/root/update.token" \
    "/root/update_token"; do
    if [ -n "${candidate}" ] && [ -f "${candidate}" ]; then
      UPDATE_TOKEN_FILE="${candidate}"
      break
    fi
  done
fi

TRATUMOS_UPDATE_REPO="${TRATUMOS_UPDATE_REPO:-WillItMod/5tratum}"
TRATUMOS_CHANNEL="${TRATUMOS_CHANNEL:-main}"
TRATUMOS_TAG="${TRATUMOS_TAG:-}"
if [ -z "${TRATUMOS_TAG}" ] && have git; then
  TRATUMOS_TAG="$(git -C "${ROOT}" describe --tags --exact-match 2>/dev/null || true)"
  if [ -z "${TRATUMOS_TAG}" ]; then
    TRATUMOS_TAG="$(git -C "${ROOT}" describe --tags --always 2>/dev/null || true)"
  fi
fi
TRATUMOS_TAG="${TRATUMOS_TAG:-unknown}"

have bsdtar || die "bsdtar not found"
have xorriso || die "xorriso not found (apt-get install -y xorriso)"

if [ ! -f "${BUNDLE_TGZ}" ]; then
  die "Missing bundle: ${BUNDLE_TGZ}. Build it via ./scripts/build-update-bundle.sh (or .ps1 on Windows)."
fi

case "${BOOT_MODE}" in
  hybrid|uefi|bios) ;;
  *)
    die "Invalid BOOT_MODE: ${BOOT_MODE}. Use: hybrid|uefi|bios"
    ;;
esac

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
cat >"${WORK_DIR}/iso/5tratumos/build.json" <<JSON
{"tag":"${TRATUMOS_TAG}","repo":"${TRATUMOS_UPDATE_REPO}","channel":"${TRATUMOS_CHANNEL}","built_at":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
JSON
if [ -n "${UPDATE_TOKEN_FILE}" ] && [ -f "${UPDATE_TOKEN_FILE}" ]; then
  install -m 0644 "${UPDATE_TOKEN_FILE}" "${WORK_DIR}/iso/5tratumos/update.token"
fi

# Embed build metadata so first boot doesn't show "unknown" until an update is applied.
if [ -z "${OS_TAG}" ]; then
  OS_TAG="unknown"
fi
cat >"${WORK_DIR}/iso/5tratumos/build.json" <<JSON
{"tag":"${OS_TAG}","repo":"WillItMod/5tratum","channel":"${OS_CHANNEL}","installed_at":""}
JSON

# Optional: embed an update token (for private update repos). This file is copied to /etc/5tratumos/update.token by late_command.sh.
if [ -n "${UPDATE_TOKEN_FILE}" ]; then
  if [ -f "${UPDATE_TOKEN_FILE}" ]; then
    install -m 0600 "${UPDATE_TOKEN_FILE}" "${WORK_DIR}/iso/5tratumos/update.token"
  else
    die "UPDATE_TOKEN_FILE not found: ${UPDATE_TOKEN_FILE}"
  fi
fi

if [ -f "${LOGO_SMALL}" ]; then
  install -m 0644 "${LOGO_SMALL}" "${WORK_DIR}/iso/5tratumos/branding/5.png"
fi
if [ -f "${LOGO_WORDMARK}" ]; then
  install -m 0644 "${LOGO_WORDMARK}" "${WORK_DIR}/iso/5tratumos/branding/WordOnlyLogo.png"
fi

echo "[4/6] Branding + preseed boot configs..."
append_args_base="auto=true priority=critical preseed/file=/cdrom/preseed.cfg"
# Some systems fall back to the text installer even when "Graphical install" is selected.
# For broad compatibility, force the GTK frontend and disable KMS (use a generic framebuffer).
append_args_gui="${append_args_base} DEBIAN_FRONTEND=gtk nomodeset"

# BIOS (isolinux)
patch_syslinux_cfg() {
  local file="$1"
  local args="$2"
  [ -f "${file}" ] || return 0
  awk -v args="${args}" '
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
    ' "${file}" >"${file}.tmp"
  mv "${file}.tmp" "${file}"
}

patch_syslinux_cfg "${WORK_DIR}/iso/isolinux/txt.cfg" "${append_args_base}"
patch_syslinux_cfg "${WORK_DIR}/iso/isolinux/gtk.cfg" "${append_args_gui}"

  if [ -f "${WORK_DIR}/iso/isolinux/isolinux.cfg" ]; then
  if [ -f "${WORK_DIR}/iso/isolinux/gtk.cfg" ]; then
    sed -i "s/^default .*/default installgui/" "${WORK_DIR}/iso/isolinux/isolinux.cfg" || true
  else
    sed -i "s/^default .*/default install/" "${WORK_DIR}/iso/isolinux/isolinux.cfg" || true
  fi
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

# Syslinux splash background (BIOS) + shared GRUB theme background.
# Prefer a repo-provided asset so we don't rely on ImageMagick being available in the build environment.
if [ -d "${WORK_DIR}/iso/isolinux" ]; then
  if [ -f "${SCRIPT_DIR}/files/isolinux/splash.png" ]; then
    install -m 0644 "${SCRIPT_DIR}/files/isolinux/splash.png" "${WORK_DIR}/iso/isolinux/splash.png"
  elif have_imagemagick_convert && [ -f "${WORK_DIR}/iso/5tratumos/branding/WordOnlyLogo.png" ]; then
    tmp_splash="${WORK_DIR}/iso/isolinux/splash.png"
    convert -size 640x480 xc:'#07090e' \
      "${WORK_DIR}/iso/5tratumos/branding/WordOnlyLogo.png" -resize 520x -gravity north -geometry +0+60 -composite \
      "${WORK_DIR}/iso/5tratumos/branding/5.png" -resize 90x -gravity northeast -geometry +36+24 -composite \
      "${tmp_splash}" || true
  fi
fi

# UEFI (grub)
if [ -f "${WORK_DIR}/iso/boot/grub/grub.cfg" ]; then
  awk -v base="${append_args_base}" -v gui="${append_args_gui}" '
    function inject(line, args) {
      if (index(line, "preseed/file=/cdrom/preseed.cfg") > 0) {
        if (index(args, "DEBIAN_FRONTEND=gtk") > 0 && index(line, "DEBIAN_FRONTEND=gtk") == 0) {
          line = line " DEBIAN_FRONTEND=gtk"
        }
        if (index(args, "nomodeset") > 0 && index(line, "nomodeset") == 0) {
          line = line " nomodeset"
        }
        return line
      }
      sub(/linux[[:space:]]+\/install\.amd\/vmlinuz[[:space:]]+/, "&" args " ", line)
      return line
    }
    BEGIN { pending = 0; pline = "" }
    /^[[:space:]]*linux[[:space:]]+\/install\.amd\/vmlinuz[[:space:]]/ {
      pending = 1
      pline = $0
      next
    }
    {
      if (pending) {
        if ($0 ~ /^[[:space:]]*initrd[[:space:]]+/) {
          args = ($0 ~ /\/install\.amd\/gtk\/initrd\.gz/) ? gui : base
          print inject(pline, args)
          pending = 0
          pline = ""
          print $0
          next
        } else {
          print inject(pline, base)
          pending = 0
          pline = ""
        }
      }
      print $0
    }
    END {
      if (pending) {
        print inject(pline, base)
      }
    }
  ' "${WORK_DIR}/iso/boot/grub/grub.cfg" >"${WORK_DIR}/iso/boot/grub/grub.cfg.tmp"
  mv "${WORK_DIR}/iso/boot/grub/grub.cfg.tmp" "${WORK_DIR}/iso/boot/grub/grub.cfg"
  sed -i "s/^set timeout=.*/set timeout=3/" "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
fi
if [ -f "${WORK_DIR}/iso/boot/grub/grub.cfg" ]; then
  sed -i 's/Debian GNU\/Linux installer menu/5tratumOS Installer/g' "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
  sed -i 's/Debian Installer/5tratumOS Installer/g' "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
  sed -i 's/Debian installer/5tratumOS installer/g' "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
fi

# GRUB menu background.
if [ -f "${SCRIPT_DIR}/files/grub/background.png" ]; then
  bg="${WORK_DIR}/iso/boot/grub/background.png"
  install -m 0644 "${SCRIPT_DIR}/files/grub/background.png" "${bg}"
  if ! grep -q 'background_image' "${WORK_DIR}/iso/boot/grub/grub.cfg"; then
    sed -i "1i\\insmod png\\nbackground_image -m stretch /boot/grub/background.png\\n" "${WORK_DIR}/iso/boot/grub/grub.cfg" || true
  fi
elif have_imagemagick_convert && [ -f "${WORK_DIR}/iso/5tratumos/branding/WordOnlyLogo.png" ]; then
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

# Ensure UEFI removable-media boot can find a GRUB config.
# Some firmware / USB writers expect `EFI/BOOT/grub.cfg` (not just `/boot/grub/grub.cfg`).
if [ "${BOOT_MODE}" != "bios" ]; then
  efi_boot_dir=""
  if [ -d "${WORK_DIR}/iso/EFI/BOOT" ]; then
    efi_boot_dir="${WORK_DIR}/iso/EFI/BOOT"
  elif [ -d "${WORK_DIR}/iso/EFI/boot" ]; then
    efi_boot_dir="${WORK_DIR}/iso/EFI/boot"
  fi

  id_file_path="$(ls -1 "${WORK_DIR}/iso/.disk/id/"* 2>/dev/null | head -n 1 || true)"
  id_file=""
  if [ -n "${id_file_path}" ]; then
    id_file="$(basename -- "${id_file_path}")"
  fi
  if [ -n "${efi_boot_dir}" ] && [ -n "${id_file}" ]; then
    cat >"${efi_boot_dir}/grub.cfg" <<EOF
# Load partition/filesystem modules early; otherwise search --file can drop to a GRUB prompt on some UEFI firmware.
insmod part_gpt
insmod part_msdos
insmod iso9660

# Prefer common device mappings before falling back to search.
if [ -e (cd0,msdos2)/.disk/id/${id_file} ]; then
  set root=(cd0,msdos2)
elif [ -e (cd0)/.disk/id/${id_file} ]; then
  set root=(cd0)
else
  search --file --set=root /.disk/id/${id_file}
fi

set prefix=(\$root)/boot/grub
source \$prefix/\${grub_cpu}-efi/grub.cfg
EOF

    # Debian's GRUB EFI binaries are built with prefix /EFI/debian, so they look for /EFI/debian/grub.cfg on the ISO.
    # We exclude a root-level "debian" symlink during extraction for Windows compatibility; recreate the needed EFI/debian config here.
    mkdir -p "${WORK_DIR}/iso/EFI/debian"
    cat >"${WORK_DIR}/iso/EFI/debian/grub.cfg" <<EOF
search --file --set=root /.disk/id/${id_file}
set prefix=(\$root)/boot/grub
source \$prefix/\${grub_cpu}-efi/grub.cfg
EOF
  fi

  # Patch the embedded EFI System Partition image (boot/grub/efi.img) so UEFI USB boots work reliably.
  if [ -f "${WORK_DIR}/iso/boot/grub/efi.img" ] && [ -f "${efi_boot_dir}/grub.cfg" ]; then
    mcopy_bin="$(command -v mcopy 2>/dev/null || true)"
    if [ -z "${mcopy_bin}" ]; then
      echo "warn: mcopy not found; attempting to download mtools to extract it..." >&2
      pkg_dir="${WORK_DIR}/pkg-mtools"
      rm -rf "${pkg_dir}"
      mkdir -p "${pkg_dir}"
      if command -v apt-get >/dev/null 2>&1; then
        (
          cd "${pkg_dir}"
          apt-get download mtools >/dev/null 2>&1 || true
        )
        deb="$(ls -1 "${pkg_dir}"/mtools_*.deb 2>/dev/null | head -n 1 || true)"
        if [ -n "${deb}" ] && command -v dpkg-deb >/dev/null 2>&1; then
          dpkg-deb -x "${deb}" "${pkg_dir}/extract" >/dev/null 2>&1 || true
          if [ -x "${pkg_dir}/extract/usr/bin/mcopy" ]; then
            mcopy_bin="${pkg_dir}/extract/usr/bin/mcopy"
          fi
        fi
      fi
    fi
    [ -n "${mcopy_bin}" ] || die "mtools (mcopy) not found (apt-get install -y mtools)"

    chmod u+w "${WORK_DIR}/iso/boot/grub/efi.img" >/dev/null 2>&1 || true
    "${mcopy_bin}" -o -i "${WORK_DIR}/iso/boot/grub/efi.img" "${efi_boot_dir}/grub.cfg" ::/EFI/BOOT/grub.cfg
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

if [ "${BOOT_MODE}" != "uefi" ]; then
  [ -f "${WORK_DIR}/iso/${isolinux_bin}" ] || die "Missing isolinux boot image: ${isolinux_bin}"
fi

efi_img=""
if [ "${BOOT_MODE}" != "bios" ]; then
  if [ -f "${WORK_DIR}/iso/boot/grub/efi.img" ]; then
    efi_img="boot/grub/efi.img"
  elif [ -f "${WORK_DIR}/iso/efi.img" ]; then
    efi_img="efi.img"
  else
    die "Unable to find efi.img in extracted ISO"
  fi
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
if [ "${BOOT_MODE}" = "uefi" ]; then
  VOLID="5TRATUMOS_UEFI"
elif [ "${BOOT_MODE}" = "bios" ]; then
  VOLID="5TRATUMOS_BIOS"
fi

mbr_arg="${mbr}"
if [ -z "${mbr_arg}" ]; then
  # xorriso can take the isohybrid MBR from an existing ISO (no syslinux package needed).
  mbr_arg="--interval:local_fs:0s-15s:zero_mbrpt,zero_gpt,zero_apm:${DEBIAN_ISO}"
  echo "warn: isohdpfx.bin not found; using MBR from: ${DEBIAN_ISO}" >&2
fi

rm -f "${OUT_ISO}" >/dev/null 2>&1 || true

mkisofs_args=(
  -as mkisofs
  -o "${OUT_ISO}"
  -V "${VOLID}"
  -r -J -joliet-long
  -isohybrid-mbr "${mbr_arg}"
  -partition_offset 16
)

case "${BOOT_MODE}" in
  hybrid)
    mkisofs_args+=(
      -b "${isolinux_bin}"
      -c "${boot_cat}"
      -no-emul-boot
      -boot-load-size 4
      -boot-info-table
      -eltorito-alt-boot
      -e "${efi_img}"
      -no-emul-boot
      -isohybrid-gpt-basdat
    )
    ;;
  bios)
    mkisofs_args+=(
      -b "${isolinux_bin}"
      -c "${boot_cat}"
      -no-emul-boot
      -boot-load-size 4
      -boot-info-table
    )
    ;;
  uefi)
    mkisofs_args+=(
      -e "${efi_img}"
      -no-emul-boot
      -isohybrid-gpt-basdat
    )
    ;;
esac

mkisofs_args+=("${WORK_DIR}/iso")

xorriso "${mkisofs_args[@]}"

echo "Wrote:"
echo "  ${OUT_ISO}"

# Write a sidecar SHA256 for convenience (do not include any secrets).
if command -v sha256sum >/dev/null 2>&1; then
  sha_file="${OUT_ISO}.sha256"
  (
    cd -- "$(dirname -- "${OUT_ISO}")"
    sha256sum "$(basename -- "${OUT_ISO}")" >"$(basename -- "${sha_file}")"
  )
  echo "  ${sha_file}"
fi
