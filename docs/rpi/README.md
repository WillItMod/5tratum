# Raspberry Pi (arm64) Install

This guide is for the **Raspberry Pi image** distributed in GitHub Releases.

## Supported

- Raspberry Pi **4 / 5** (64-bit / arm64)
- 8GB RAM recommended
- 64GB+ microSD/SSD for the OS
- External SSD/NVMe strongly recommended for app data and chain storage
- Wired Ethernet recommended

## Download

From the release assets:

- `5tratumos-raspios-lite-v<version>.img.xz`
- `5tratumos-raspios-lite-v<version>.img.xz.sha256`

Current BETA release:
- https://github.com/WillItMod/5tratum/releases/tag/v0.5.00

All releases:
- https://github.com/WillItMod/5tratum/releases

At the time of writing, the newest BETA Raspberry Pi image is under tag **v0.5.00**:
- `5tratumos-raspios-lite-v0.5.00.img.xz`

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
5) Choose your SD card -> **Write**

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

The bootstrap installer defaults to the current BETA main-channel bundle:
`v0.5.00`.

## First boot

- Boot the Pi from the microSD card.
- Find the device on your network (router/DHCP list).
- Open the UI in a browser: `http://<pi-ip>/`
- The first boot installs 5tratumOS from the embedded bundle and may reboot once.
- First boot can take several minutes. If the dashboard does not load immediately, wait and check again.

Useful debug log if the dashboard does not appear:

```sh
sudo cat /var/log/5tratumos-rpi-firstboot-install.log
```

## Verify download (optional)

Use the checksum guide:

- [VERIFY.md](../install/VERIFY.md)

## Raspberry Pi 5: external NVMe not detected

If you're running 5tratumOS on a Raspberry Pi 5 (OS on microSD) and want to use an NVMe as an external drive for apps/core downloads:

- **Issue:** the Pi/OS did not recognize the external NVMe
- **Solution:**
  1) In 5tratumOS: go to Settings and enable SSH and set your SSH password.
  2) SSH into your Pi (username: `admin`).
  3) Follow the "Mount a storage device" section from the official Raspberry Pi documentation:
     - https://www.raspberrypi.com/documentation/computers/configuration.html#automatically-mount-a-storage-device
  4) Enable the external PCIe port:
     - `sudo nano /boot/firmware/config.txt`
     - Add these two lines:
       - `dtparam=pciex1`
       - `dtparam=pciex1_gen=3`
  5) Restart/reboot the Pi. If all goes well you should see the NVMe listed in Settings -> Storage & Drives.

Credit: Eric Jim
