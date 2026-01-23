# Raspberry Pi Image (Debian Trixie Lite + 5tratumOS)

This document describes how to build a flashable Raspberry Pi image for Raspberry Pi Imager / Balena Etcher.

Goal:
- Debian 13 (Trixie) arm64 "lite" base (Pi 4/5)
- 5tratumOS installed on top
- kiosk on HDMI
- no preinstalled apps
- no embedded secrets/tokens

## Inputs

- A base arm64 Debian Trixie lite image (Pi 4/5) stored locally (example folder: `C:\VSC\ISO\RPi`)
- A 5tratumOS update bundle for the target release: `dist/5tratumos-update.tgz`

## Build host requirements (Linux)

Build on a Linux box (e.g. the Proxmox host or a Debian VM). You need:
- `xz`, `parted`, `losetup`, `mount`, `rsync`
- `systemd-container` (optional) or chroot + `qemu-user-static` for arm64 images

## High level steps

1) Decompress the base image (if needed) into a working `.img`.
2) Attach the image as a loop device and mount its partitions (boot + root).
3) Chroot into the root filesystem (arm64).
4) Extract and install the `5tratumos-update.tgz` payload into `/opt/5tratumos`, `/usr/local/bin/5tratumos`, and systemd units.
5) Enable 5tratumOS services + kiosk for user `forge`.
6) Ensure first-boot tasks are reset (machine-id, ssh host keys, etc.).
7) Detach loop device and compress the resulting `.img` with `xz` for distribution.

## Update token (safe provisioning)

Do NOT embed tokens into published images.

If you need updates from a private GitHub repo, provide a token at flash time by placing a file on the Pi boot partition:

- `/boot/firmware/update.token`
  - or `/boot/firmware/5tratumos/update.token`

On first boot, `5tratumOS` will copy it to:
- `/etc/5tratumos/update.token`

This is implemented in `bootstrap/firstboot.sh` (`adopt_update_token()`).

## Output

- `5tratumos-rpi-vX.Y.Z.img.xz`
- `5tratumos-rpi-vX.Y.Z.img.xz.sha256`

## Notes

- mDNS: the hostname defaults to `5tratumos` and should be reachable at `5tratumos.local` on networks where mDNS is available (Avahi enabled).
- Keep images clean: do not install any apps into `/opt/5tratumos/apps` or `/var/lib/5tratumos/apps` before capture.
