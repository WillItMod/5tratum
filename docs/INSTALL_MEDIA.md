# Install Media (Etcher Image + Bootable Installer ISO)

5tratumOS supports two “bare metal” install paths:

## 1) Etcher disk image (recommended first)

You ship a compressed raw disk image (`.img.xz`) that users flash to an SSD/NVMe/USB using Balena Etcher.

Pros:
- simplest for users
- least moving parts
- easiest to support

Cons:
- overwrites the entire target disk

Note:
- the flashed OS auto-expands its root filesystem on first boot (ext4).

## 2) Bootable installer ISO (USB)

You ship a bootable ISO that runs an unattended Debian netinst and installs the embedded 5tratumOS bundle.

Pros:
- guided UX (select disk, confirm)
- works even when the user doesn’t want to install Etcher

Cons:
- more engineering and testing than Etcher image

Note:
- the installer erases the selected target disk.

### Building the ISO

The ISO build is driven from `installer/build-debian-preseed-iso.sh` and embeds:
- `dist/5tratumos-update.tgz` (the OS bundle)
- `installer/debian-installer/preseed.cfg` + `installer/debian-installer/late_command.sh`
- `5tratumos/build.json` (so the UI shows the correct version on first boot)
- optionally: `5tratumos/update.token` (only needed for private update repos)

Build steps (run on a Debian/Ubuntu box â€” e.g. your Proxmox host or a Debian VM):

```bash
cd /opt/5tratum_Build/5tratumOS

# 1) build the update bundle
./scripts/build-update-bundle.sh

# 2) build the installer ISO
OS_TAG="v0.x.y" ./installer/build-debian-preseed-iso.sh
```

Optional token injection (without committing secrets):

```bash
OS_TAG="v0.x.y" UPDATE_TOKEN_FILE="/root/update.token" ./installer/build-debian-preseed-iso.sh
```

## Proxmox

Proxmox is a separate virtualized path:
- import a qcow2/raw disk or clone from a VM template

It is not the same as ISO/Etcher bare-metal installs.
