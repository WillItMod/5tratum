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

Boot modes:
- `BOOT_MODE=hybrid` (default): BIOS + UEFI in one ISO
- `BOOT_MODE=uefi`: UEFI-only
- `BOOT_MODE=bios`: Legacy BIOS-only

Prereqs on the build machine (Debian recommended):
- `bsdtar`
- `xorriso`
- `syslinux-common` (for `isohdpfx.bin`)

Embedded files:
- `/preseed.cfg` from `installer/debian-installer/preseed.cfg`
- `/5tratumos/late_command.sh` from `installer/debian-installer/late_command.sh`
- `/5tratumos/5tratumos-update.tgz` from `dist/5tratumos-update.tgz`

Optional provisioning files:
- `/update.token` (preferred) or `/update_token` (legacy) at the ISO root (or under `/5tratumos/`) to seed `/etc/5tratumos/update.token` for private GitHub repos.

## Raspberry Pi OS Lite image (arm64)

If you want a Raspberry Pi Imager-friendly `.img.xz` that keeps Imager Wi‑Fi/SSH customization working, use:

- `installer/build-raspios-image.sh`

It embeds `dist/5tratumos-update.tgz` onto the boot partition and installs 5tratumOS + kiosk on first boot.

## Legacy: live-build TUI installer

The older live-build based installer remains in `installer/build-installer-iso.sh` but is not the recommended path.
