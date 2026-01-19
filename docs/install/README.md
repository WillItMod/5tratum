# Install 5tratumOS

5tratumOS is distributed as **boot media** attached to each GitHub Release.

## Downloads (per release)

You will see one or both of these artifacts:

1) **Installer ISO** (recommended)
   - Filename: `5tratumos-installer.iso`
   - Purpose: boot into an installer that will **wipe the selected target disk** and install 5tratumOS onto it.
   - Works for: Proxmox/VM CD-ROM boot, USB stick boot (Etcher/Rufus), and writing the installer ISO directly to a drive.

2) **Direct-flash disk image** (advanced)
   - Filename: `5tratumOS_v<version>_Balena.img.xz` (example: `5tratumOS_v0.3.64_Balena.img.xz`)
   - Purpose: write a bootable OS disk image directly to a disk (USB/SSD) in one step.
   - Note: not available for every release.

If you're unsure: use the **Installer ISO**.

## Before you start

- Back up anything important. The installer will wipe the selected disk.
- Use a **USB stick (8GB+)** for the installer, or attach the ISO to a VM.
- After install completes, remove the USB/ISO and reboot into the installed OS.

## Proxmox / VM

1. Create a VM (UEFI recommended).
2. Attach `5tratumos-installer.iso` as a CD-ROM.
3. Boot the VM and follow the on-screen installer prompts.
4. When the installer finishes, detach the ISO and reboot.

## Physical hardware (USB via Balena Etcher)

1. Download `5tratumos-installer.iso` from the Release assets.
2. (Optional) Verify the download: `docs/install/VERIFY.md`
3. Open **Balena Etcher**:
   - Flash from file: `5tratumos-installer.iso`
   - Select target: your USB stick
   - Flash
4. Boot the target machine from the USB stick.
5. Follow the installer prompts to select the target disk and confirm the wipe.
6. When finished:
   - Remove the USB stick
   - Reboot

## Physical hardware (Balena Etcher direct-flash image)

This option writes a complete OS disk image directly to your target disk.

1. Download `5tratumOS_v<version>_Balena.img.xz` from the Release assets.
2. (Optional) Verify the download: `docs/install/VERIFY.md`
3. Open **Balena Etcher**:
   - Flash from file: `5tratumOS_v<version>_Balena.img.xz`
   - Select target: your OS disk (USB/SSD)
   - Flash
4. Boot the target machine from that disk.

## Physical hardware (direct-to-drive)

If you want to write the installer ISO to a drive without Etcher (advanced), see:
- `docs/install/WRITE_DIRECT.md`
