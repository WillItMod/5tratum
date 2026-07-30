# Install 5tratumOS

5tratumOS is distributed via **GitHub Releases** (update bundles + install media). Not every tag includes every asset, so use the Releases page to find the newest installer media.

- Current BETA main-channel update: https://github.com/WillItMod/5tratum/releases/tag/v0.5.8
- Current BETA installer media: https://github.com/WillItMod/5tratum/releases/tag/v0.5.00
- Full release history: https://github.com/WillItMod/5tratum/releases

## Requirements

- **CPU:** 64-bit AMD/Intel processor for installer ISO installs.
- **Firmware:** UEFI recommended. Use the BIOS ISO only for legacy BIOS/CSM systems.
- **RAM:** 16GB minimum; 32GB+ recommended for multiple full-node apps.
- **Storage:** SSD/NVMe strongly recommended. 1TB minimum for serious use; 2TB+ recommended for multiple chains/apps.
- **Network:** Wired Ethernet recommended.
- **USB drive:** 2GB+ for installer USB media.

Raspberry Pi uses a separate arm64 image. See [Raspberry Pi install](../rpi/README.md).

## Get the installer ISO (x86_64 / amd64)

Download the current complete image directly:

- UEFI ISO: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-installer-v0.5.00-uefi.iso
- UEFI checksum: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-installer-v0.5.00-uefi.iso.sha256
- Legacy BIOS ISO: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-installer-v0.5.00-bios.iso
- Legacy BIOS checksum: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-installer-v0.5.00-bios.iso.sha256

The newest complete BETA installer media is v0.5.00. After first boot, use
`Settings -> Updates` to move to the current v0.5.8 main-channel release.
Newer `.tgz` assets are updater payloads, not bootable installers.

## Downloads (per release)

Releases include:

1) **Installer ISO (AMD/Intel)** (recommended for fresh x86 installs)
   - Filename:
     - `5tratumos-installer-v<version>-uefi.iso` (recommended)
     - `5tratumos-installer-v<version>-bios.iso` (legacy BIOS/CSM)
   - Purpose: boot into an installer that will **wipe the selected target disk** and install 5tratumOS onto it.
   - Works for: Proxmox/VM CD-ROM boot, USB stick boot (Etcher/Rufus), and writing the installer ISO directly to a drive.

2) **Raspberry Pi image (arm64)** (when published)
   - Filename: `5tratumos-raspios-lite-v<version>.img.xz`
   - Purpose: flash directly to microSD/SSD, then boot on a Raspberry Pi 4/5.
   - Current image: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-raspios-lite-v0.5.00.img.xz
   - Checksum: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-raspios-lite-v0.5.00.img.xz.sha256

If you're installing on AMD/Intel hardware and are unsure, use the **UEFI installer ISO**.

## Before you start

- Back up anything important. The installer will wipe the selected disk.
- Use a **USB stick (2GB+)** for the installer, or attach the ISO to a VM.
- Configure firmware (BIOS/UEFI) correctly or the installer may not boot/see your disk:
  - [FIRMWARE.md](FIRMWARE.md)
- If you hit a common failure mode, see:
  - [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- After install completes, remove the USB/ISO and reboot into the installed OS.

## Proxmox

### Dedicated LXC helper

Run the helper as `root` in the Proxmox VE shell:

```sh
curl -fsSL https://raw.githubusercontent.com/WillItMod/5tratum/main/scripts/install-proxmox.sh | bash
```

It creates a dedicated unprivileged Debian LXC and installs 5tratumOS inside
the guest. Docker and 5tratumOS services are not installed on the Proxmox host.
See the [complete Proxmox LXC guide](PROXMOX.md) for resource, storage,
networking and static-address options.

### Full virtual machine

1. Create a VM (UEFI recommended).
2. Attach `5tratumos-installer-v<version>-uefi.iso` as a CD-ROM.
3. Boot the VM and follow the on-screen installer prompts.
4. When the installer finishes, detach the ISO and reboot.

## Physical hardware (USB via Rufus on Windows)

1. Download `5tratumos-installer-v<version>-uefi.iso` or `5tratumos-installer-v<version>-bios.iso` from the Release assets.
2. (Optional) Verify the download: [VERIFY.md](VERIFY.md)
3. Open **Rufus**: https://rufus.ie
4. Select your USB drive and the downloaded ISO.
5. Choose:
   - UEFI ISO: GPT
   - BIOS ISO: MBR
6. If Rufus asks for write mode, choose **DD Image mode**.
7. Boot the target machine from the USB stick.
8. Follow the installer prompts to select the target disk and confirm the wipe.
9. When finished:
   - Remove the USB stick
   - Reboot

## Physical hardware (USB via Balena Etcher)

1. Download `5tratumos-installer-v<version>-uefi.iso` or `5tratumos-installer-v<version>-bios.iso` from the Release assets.
2. (Optional) Verify the download: [VERIFY.md](VERIFY.md)
3. Open **Balena Etcher**.
4. Flash from file: `5tratumos-installer-v<version>-uefi.iso` or `5tratumos-installer-v<version>-bios.iso`.
5. Select target: your USB stick.
6. Flash.
7. Boot the target machine from the USB stick.
8. Follow the installer prompts to select the target disk and confirm the wipe.
9. When finished:
   - Remove the USB stick
   - Reboot

## Physical hardware (USB via Win32 Disk Imager / "WinImager")

1. Download `5tratumos-installer-v<version>-uefi.iso` or `5tratumos-installer-v<version>-bios.iso` from the Release assets.
2. (Optional) Verify the download: [VERIFY.md](VERIFY.md)
3. Open **Win32 Disk Imager**:
   - Image file: select `5tratumos-installer-v<version>-uefi.iso` or `5tratumos-installer-v<version>-bios.iso` (you may need to choose "*.* / All files")
   - Device: select your USB drive letter
   - Write
4. Boot the target machine from the USB stick.
5. Follow the installer prompts to select the target disk and confirm the wipe.
6. When finished:
   - Remove the USB stick
   - Reboot

## Physical hardware (direct-to-drive)

If you want to write the installer ISO to a drive without Etcher (advanced), see:
- [WRITE_DIRECT.md](WRITE_DIRECT.md)
