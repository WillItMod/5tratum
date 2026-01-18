#!/usr/bin/env bash
set -euo pipefail

have() { command -v "$1" >/dev/null 2>&1; }

if [ "${EUID:-$(id -u)}" -ne 0 ]; then
  echo "error: run as root (try: sudo $0)" >&2
  exit 1
fi

if ! have findmnt || ! have lsblk; then
  exit 0
fi

root_src="$(findmnt -n -o SOURCE --target / 2>/dev/null || true)"
root_fstype="$(findmnt -n -o FSTYPE --target / 2>/dev/null || true)"

case "${root_src}" in
  /dev/*) ;;
  *) exit 0 ;;
esac

if [ "${root_fstype}" != "ext4" ]; then
  exit 0
fi

if ! have resize2fs; then
  exit 0
fi

partnum="$(lsblk -no PARTNUM "${root_src}" 2>/dev/null || true)"
parent="$(lsblk -no PKNAME "${root_src}" 2>/dev/null || true)"

if [ -z "${partnum}" ] || [ -z "${parent}" ]; then
  exit 0
fi

disk="/dev/${parent}"

if have growpart; then
  echo "[growfs] Growing partition: ${disk} ${partnum}"
  growpart "${disk}" "${partnum}" >/dev/null 2>&1 || true
fi

echo "[growfs] Resizing filesystem: ${root_src}"
resize2fs "${root_src}" >/dev/null 2>&1 || true

