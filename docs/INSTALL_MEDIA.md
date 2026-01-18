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

You ship a bootable ISO that runs a guided text installer and writes the 5tratumOS disk image to a selected target disk.

Pros:
- guided UX (select disk, confirm)
- works even when the user doesn’t want to install Etcher

Cons:
- more engineering and testing than Etcher image

Note:
- this is a guided wrapper around the same disk image; it still erases the selected target disk.

## Proxmox

Proxmox is a separate virtualized path:
- import a qcow2/raw disk or clone from a VM template

It is not the same as ISO/Etcher bare-metal installs.
