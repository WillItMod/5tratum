# 5tratumOS Installer ISO

This folder contains build tooling for a bootable **installer ISO** intended for USB installs and VM testing.

## Debian Installer (preseed) — recommended

This produces a Debian Installer ISO that **boots directly into an installer** (not a live desktop) and installs 5tratumOS with minimal prompts.

Behavior:
- installs Debian via the standard Debian Installer
- uses Debian's normal partitioning confirmation step as the disk wipe confirmation
- installs 5tratumOS (daemon + portal + templates) from an embedded update bundle
- finishes with the normal "remove install media and reboot" flow

Build entrypoint: `installer/build-debian-preseed-iso.sh`

Prereqs on the build machine (Debian recommended):
- `bsdtar`
- `xorriso`
- `syslinux-common` (for `isohdpfx.bin`)
- `mtools` (recommended, improves UEFI boot compatibility on some systems)

## USB boot compatibility notes

Most users should flash the ISO directly (e.g. Balena Etcher / Win32DiskImager).

If you have a system/USB that refuses to boot a hybrid ISO, a manual fallback that has worked:

1. Partition the USB as GPT and create a single FAT32 partition.
2. Extract/copy the ISO contents onto the USB (e.g. `bsdtar -x -f 5tratumos-installer.iso -C /mnt/usb` or `rsync -a`).
3. Ensure `EFI/BOOT/grub.cfg` exists on the USB (some firmware expects the GRUB config there).

The preseed ISO build script mirrors `/boot/grub/grub.cfg` to `EFI/BOOT/grub.cfg` to improve compatibility for these cases.

Note: for Etcher/DD-style raw writes, the system typically boots the embedded EFI System Partition image (`efi.img`).
If `mtools` is installed on the build machine, the build script also copies `grub.cfg` into `EFI/BOOT/grub.cfg`
inside that EFI image to improve compatibility with picky firmware.

Embedded files:
- `/preseed.cfg` from `installer/debian-installer/preseed.cfg`
- `/5tratumos/late_command.sh` from `installer/debian-installer/late_command.sh`
- `/5tratumos/5tratumos-update.tgz` from `dist/5tratumos-update.tgz`

Optional provisioning files:
- `/update.token` or `/5tratumos/update.token` (on the install media) to seed `/etc/5tratumos/update.token` for private GitHub repos.

## Legacy: live-build TUI installer

The older live-build based installer remains in `installer/build-installer-iso.sh` but is not the recommended path.
