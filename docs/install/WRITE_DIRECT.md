# Write install media directly to a drive (advanced)

If you prefer not to use Balena Etcher, you can write the boot media directly to a USB stick or disk.

This is destructive to the target drive. Double-check the device path.

## Windows (Win32 Disk Imager / "WinImager")

1. Open **Win32 Disk Imager**.
2. Select `5tratumos-installer-v<version>-uefi.iso` or `5tratumos-installer-v<version>-bios.iso` (you may need to choose "*.* / All files").
3. Select the correct target USB drive letter.
4. Click **Write**, then boot from the USB drive and follow the installer.

## Linux

1. Identify the device (example: `/dev/sdX`):

```sh
lsblk
```

2. Write the ISO:

```sh
sudo dd if=5tratumos-installer-v<version>-uefi.iso of=/dev/sdX bs=8M status=progress oflag=sync
sync
```

3. Boot from that drive and follow the installer.

## macOS

1. Identify the device (example: `/dev/diskN`):

```sh
diskutil list
```

2. Unmount the disk and write:

```sh
diskutil unmountDisk /dev/diskN
sudo dd if=5tratumos-installer-v<version>-uefi.iso of=/dev/rdiskN bs=8m
sync
```

3. Boot and install.
