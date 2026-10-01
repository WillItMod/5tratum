# Raspberry Pi (arm64) Install

This guide is for the **Raspberry Pi image** distributed in GitHub Releases.

## Supported

- Raspberry Pi **4 / 5** (64-bit / arm64)
- 8GB RAM recommended
- 64GB+ microSD/SSD for the OS
- External SSD/NVMe strongly recommended for app data and chain storage
- Wired Ethernet recommended

## Download

Current **v0.8.10 image (revision rpi1)**:

- Image: https://github.com/WillItMod/5tratum/releases/download/v0.8.10/5tratumos-raspios-lite-v0.8.10-arm64.img.xz
- Checksum: https://github.com/WillItMod/5tratum/releases/download/v0.8.10/5tratumos-raspios-lite-v0.8.10-arm64.img.xz.sha256
- Release notes: https://github.com/WillItMod/5tratum/releases/tag/v0.8.10

All releases:
- https://github.com/WillItMod/5tratum/releases

Image filename:
- `5tratumos-raspios-lite-v0.8.10-arm64.img.xz`

The image embeds the published v0.8.10 rollup with one console-installer
correction: ARM64 no longer requests `xserver-xorg-video-vesa`, which is not
available on this architecture. This fixes the reported first-boot installer
failure. The existing v0.8.10 update archives remain unchanged.

**Physical Raspberry Pi boot testing remains outstanding.** Read the release
notes for image provenance and the complete validation evidence.

## Flash with Raspberry Pi Imager (recommended)

1) Install **Raspberry Pi Imager**
2) Click **Choose OS** -> **Use custom**
3) Select the downloaded `.img.xz`
4) Click the **gear / settings** (OS Customisation) and set:
   - Hostname (optional)
   - Username + password (recommended if you want SSH access)
   - Wi-Fi SSID + password (optional)
   - Locale/keyboard (recommended)
   - Enable SSH (recommended)
5) Choose your microSD card or SSD -> **Write**

Writing the image erases the selected device. Before replacing an existing
Umbrel or 5tratumOS installation, preserve its wallet files and application data
on another device. Use a separate microSD/SSD for the new installation when
recovering data from an old drive.

## Install over SSH on Raspberry Pi OS Lite

If you already have a Raspberry Pi running Raspberry Pi OS Lite 64-bit, you can
install 5tratumOS over SSH:

```sh
ssh -t <user>@<pi-ip> "curl -fsSL https://raw.githubusercontent.com/WillItMod/5tratum/main/scripts/install-rpi.sh -o /tmp/install-rpi.sh && sudo env CHANNEL=main bash /tmp/install-rpi.sh"
```

Example:

```sh
ssh -t pi@192.168.1.50 "curl -fsSL https://raw.githubusercontent.com/WillItMod/5tratum/main/scripts/install-rpi.sh -o /tmp/install-rpi.sh && sudo env CHANNEL=main bash /tmp/install-rpi.sh"
```

The bootstrap installer defaults to `INSTALL_TAG=v0.8.10` and
`CHANNEL=main`. It downloads `5tratumos-rpi-payload-v0.8.10-rpi1.tgz`, which
contains the same corrected payload embedded in the Pi image. Its checksum
must verify before the bundle is installed.
A different release can be selected explicitly with `sudo env CHANNEL=main INSTALL_TAG=TAG`
when invoking the helper.

## First boot

- Boot the Pi from the microSD card or SSD.
- Find the device on your network (router/DHCP list).
- Open the UI in a browser: `http://<pi-ip>/`
- The first boot installs 5tratumOS from the embedded bundle and may reboot once.
- First boot can take several minutes. If the dashboard does not load immediately, wait and check again.

Useful debug log if the dashboard does not appear:

```sh
sudo cat /var/log/5tratumos-rpi-firstboot-install.log
```

## Verify download

Use the checksum guide:

- [VERIFY.md](../install/VERIFY.md)

## Raspberry Pi 5: external NVMe not detected

For an NVMe connected through the Pi 5 PCIe connector, a HAT+ device should be
detected automatically. A non-HAT+ adapter may need the connector enabled:

1. Enable SSH in 5tratumOS Settings and connect using your configured SSH account.
2. Edit `/boot/firmware/config.txt` with `sudo nano /boot/firmware/config.txt`.
3. Add `dtparam=pciex1` if it is not already enabled, then save and reboot.

Keep the default PCIe Gen 2 speed while setting up or troubleshooting storage.
`dtparam=pciex1_gen=3` is **not required** to detect or use an NVMe. Raspberry Pi
states that the Pi 5 is not certified for Gen 3 and that the connection may be
unstable. If that line was added while following an older version of this guide,
remove or comment it out and reboot to return to the default speed.
See the official [PCIe enablement and speed documentation](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#enable-pcie).

These PCIe settings do not apply to an SSD connected by USB. Using an SSD for app
data also does not require changing the Pi's boot device.

## Make the drive available for app data

A detected disk still needs a mounted filesystem. Check the device, filesystem
and mount location with this read-only command:

```sh
lsblk -o NAME,SIZE,FSTYPE,UUID,MOUNTPOINTS
```

For an existing filesystem, follow Raspberry Pi's
[automatic mounting guide](https://www.raspberrypi.com/documentation/computers/configuration.html#automatically-mount-a-storage-device),
then register its actual mountpoint in **Settings -> Storage & Drives** and save.
Select the mounted drive root, for example `/mnt/ssd`, rather than an application
subdirectory such as `/mnt/ssd/5tratumos/apps`. An ordinary directory on the OS
disk is not an external drive, even if its name contains `ssd` or `data`.
Do not format a drive containing app or wallet data to resolve a move error.

Choosing a default drive applies to **new installs**. For an existing app, use
its **Move data...** action and review the source and destination paths. To move
back to the system drive, select **OS disk (system)**. The move copies the app's
data; shared container images and the OS app launcher remain on the OS disk.

## Check a move and its retained backup

The normal app data entry is `/var/lib/5tratumos/apps/<app-id>`. When stored on an
external drive, that entry is a symbolic link to
`<mountpoint>/5tratumos/apps/<app-id>`. A move back to the OS disk replaces the
link with a local data directory. A custom filesystem mounted beneath the OS
data path needs separate review, because the pathname alone does not identify
which physical drive holds the data.

The original data is retained for recovery after a move. Existing destination
data also requires explicit review and confirmation before replacement and is
retained as a backup. As a result, the source drive's used space may stay the
same after a successful move. Check the move status, the active data path and
the app itself before using **Storage -> Scan unused data** to review backups.

For diagnosis, replace `APP_ID` with the installed app's ID:

```sh
readlink -f /var/lib/5tratumos/apps/APP_ID
findmnt --target /var/lib/5tratumos/apps/APP_ID
findmnt --target /
```

Compare the resolved path and filesystem source with the chosen destination.
These commands inspect the filesystem mapping; they do not prove that every
running app container uses it. If a move fails, or the app still appears to use
the old drive, keep the exact error, source path, destination path and mount
details for diagnosis. Leave the retained copies in place until the active app
data has been verified.

Credit: Eric Jim
