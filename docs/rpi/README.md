# Raspberry Pi (arm64) Install

This guide is for the **Raspberry Pi image** distributed in GitHub Releases.

## Supported

- Raspberry Pi **4 / 5** (64-bit / arm64)
- microSD card (16GB+ recommended)

## Download

From the release assets:

- `5tratumos-raspios-*.img.xz`
- `5tratumos-raspios-*.img.xz.sha256`

Release page:
- https://github.com/WillItMod/5tratum/releases

At the time of writing, the newest Raspberry Pi image is under tag **v0.3.184** (asset `5tratumos-raspios-lite-v0.3.184.img.xz`).

## Flash with Raspberry Pi Imager (recommended)

1) Install **Raspberry Pi Imager**
2) Click **Choose OS** -> **Use custom**
3) Select the downloaded `.img.xz`
4) Click the **gear / settings** (OS Customisation) and set:
   - Wi-Fi SSID + password (optional)
   - Locale/keyboard (recommended)
   - Enable SSH (recommended)
5) Choose your SD card -> **Write**

## First boot

- Boot the Pi from the microSD card.
- Find the device on your network (router/DHCP list).
- Open the UI in a browser: `http://<pi-ip>/`

## Verify download (optional)

Use the checksum guide:

- `docs/install/VERIFY.md`

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
