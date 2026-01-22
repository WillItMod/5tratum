# Install 5tratumOS

5tratumOS is distributed as **boot media** attached to each GitHub Release.

## Requirements

- **CPU:** AMD/INTEL only (x86_64 / amd64)
- **RAM:** 16GB absolute minimum
- **USB drive:** 1GB minimum (2GB+ recommended)

This will not run on a potato. But it will run on a donut. Actually, it runs on donuts.

## Latest release

- v0.3.113 release: https://github.com/WillItMod/5tratum/releases/tag/v0.3.113
- v0.3.113 installer ISO: https://github.com/WillItMod/5tratum/releases/download/v0.3.113/5tratumos-installer-v0.3.113.iso
- v0.3.113 checksum: https://github.com/WillItMod/5tratum/releases/download/v0.3.113/5tratumos-installer-v0.3.113.iso.sha256
- v0.3.113 Raspberry Pi image (.img.xz): https://github.com/WillItMod/5tratum/releases/download/v0.3.113/5tratumos-raspios-trixie-arm64-lite-v0.3.113.img.xz
- v0.3.113 Raspberry Pi checksum: https://github.com/WillItMod/5tratum/releases/download/v0.3.113/5tratumos-raspios-trixie-arm64-lite-v0.3.113.img.xz.sha256

Note: release asset filenames are versioned (e.g. `...-v0.3.113.iso`).

## Downloads (per release)

Releases include:

1) **Installer ISO (AMD/INTEL)** (recommended)
   - Filename: `5tratumos-installer-v0.3.113.iso`
   - Purpose: boot into an installer that will **wipe the selected target disk** and install 5tratumOS onto it.
   - Works for: Proxmox/VM CD-ROM boot, USB stick boot (Etcher/Rufus), and writing the installer ISO directly to a drive.

2) **Raspberry Pi image (arm64)**
   - Filename: `5tratumos-raspios-trixie-arm64-lite-<version>.img.xz`
   - Purpose: flash directly to microSD, then boot and configure via Raspberry Pi Imager options.

If you're unsure: use the **Installer ISO** (AMD/INTEL).

## Before you start

- Back up anything important. The installer will wipe the selected disk.
- Use a **USB stick (1GB+)** for the installer, or attach the ISO to a VM.
- After install completes, remove the USB/ISO and reboot into the installed OS.

## Proxmox / VM

1. Create a VM (UEFI recommended).
2. Attach `5tratumos-installer-v0.3.113.iso` as a CD-ROM.
3. Boot the VM and follow the on-screen installer prompts.
4. When the installer finishes, detach the ISO and reboot.

## Physical hardware (USB via Balena Etcher)

1. Download `5tratumos-installer-v0.3.113.iso` from the Release assets.
2. (Optional) Verify the download: `docs/install/VERIFY.md`
3. Open **Balena Etcher**:
   - Flash from file: `5tratumos-installer-v0.3.113.iso`
   - Select target: your USB stick
   - Flash
4. Boot the target machine from the USB stick.
5. Follow the installer prompts to select the target disk and confirm the wipe.
6. When finished:
   - Remove the USB stick
   - Reboot

## Physical hardware (USB via Win32 Disk Imager / "WinImager")

1. Download `5tratumos-installer-v0.3.113.iso` from the Release assets.
2. (Optional) Verify the download: `docs/install/VERIFY.md`
3. Open **Win32 Disk Imager**:
   - Image file: select `5tratumos-installer-v0.3.113.iso` (you may need to choose "*.* / All files")
   - Device: select your USB drive letter
   - Write
4. Boot the target machine from the USB stick.
5. Follow the installer prompts to select the target disk and confirm the wipe.
6. When finished:
   - Remove the USB stick
   - Reboot

## Physical hardware (direct-to-drive)

If you want to write the installer ISO to a drive without Etcher (advanced), see:
- `docs/install/WRITE_DIRECT.md`
