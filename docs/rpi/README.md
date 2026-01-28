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
