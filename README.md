# 5tratumOS (Installer & Releases)

[![License: BUSL 1.1](https://img.shields.io/badge/license-BUSL%201.1-orange)](LICENSE)

## License (READ THIS FIRST)

This project is licensed under the **Business Source License 1.1 (BSL 1.1)**. It is **NOT** an open source license.

- **No resale / no preinstalled devices / no "built nodes" without a commercial license:** [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md)
- **Forks/derivatives are NOT welcome for redistribution:** see [LICENSE_POLICY.md](LICENSE_POLICY.md)
- License: [LICENSE](LICENSE)
- Licensing policy summary: [LICENSE_POLICY.md](LICENSE_POLICY.md)
- Trademark/branding policy: [TRADEMARK.md](TRADEMARK.md)

## Downloads

### OS update bundle (existing installs)

- Updates are delivered via the WebUI: `Settings -> Updates -> Check updates`.
- Latest MAIN update bundle: **v0.4.0** (assets: `5tratumos-update.tgz` + `.sha256`)
  - https://github.com/WillItMod/5tratum/releases/tag/v0.4.0

### Installer media

**AMD/INTEL only (x86_64 / amd64) for the installer ISO.**

Installer ISOs and Raspberry Pi images are **not attached to every release tag**. If the newest tag does not include these assets, use the **newest tag that does**.

- **AMD/INTEL installer ISO (latest published: v0.4.0)**
  - UEFI-only (recommended):
    - [Installer ISO](https://github.com/WillItMod/5tratum/releases/download/v0.4.0/5tratumos-installer-v0.4.0-uefi.iso)
    - [Installer ISO checksum](https://github.com/WillItMod/5tratum/releases/download/v0.4.0/5tratumos-installer-v0.4.0-uefi.iso.sha256)
  - Legacy BIOS-only (older hardware / CSM):
    - [Installer ISO](https://github.com/WillItMod/5tratum/releases/download/v0.4.0/5tratumos-installer-v0.4.0-bios.iso)
    - [Installer ISO checksum](https://github.com/WillItMod/5tratum/releases/download/v0.4.0/5tratumos-installer-v0.4.0-bios.iso.sha256)
- **Raspberry Pi (arm64) image (latest published: v0.4.0)**
  - [RPi image (.img.xz)](https://github.com/WillItMod/5tratum/releases/download/v0.4.0/5tratumos-raspios-lite-v0.4.0.img.xz)
  - [RPi image checksum](https://github.com/WillItMod/5tratum/releases/download/v0.4.0/5tratumos-raspios-lite-v0.4.0.img.xz.sha256)

## Requirements

- **CPU:** Modern x86_64 processor (recommended)
- **RAM:** 16GB minimum
- **Storage:** 1TB minimum (2TB recommended)
- **Installer USB (for ISO installs):** 1GB minimum (2GB+ recommended)

This will not run on a potato. But it will run on a donut. Actually, it runs on donuts.

## Flashing / Install

- Full install guide: [docs/install/README.md](docs/install/README.md)
- Firmware (BIOS/UEFI/Secure Boot) prerequisites: [docs/install/FIRMWARE.md](docs/install/FIRMWARE.md)
- Install/boot troubleshooting (common problems): [docs/install/TROUBLESHOOTING.md](docs/install/TROUBLESHOOTING.md)
- Model-specific BIOS/UEFI guides: [docs/hardware/README.md](docs/hardware/README.md)
- Verify downloads: [docs/install/VERIFY.md](docs/install/VERIFY.md)
- Raspberry Pi: [docs/rpi/README.md](docs/rpi/README.md)

## First login / finding your IP

- WebUI credentials are created on first login (there is no default admin password).
- Find the device on your LAN:
  - The IP is shown in the top bar of the WebUI once it loads.
  - Router/DHCP list: look for hostname `5tratumos`.
  - mDNS: try `http://5tratumos.local/`
  - Local console: press `Ctrl+Alt+F1` and run `ip a`
- SSH (enabled by default):
  - Username: `forge`
  - Password: `5tratum`

## Local Console (Kiosk) on physical hardware

5tratumOS can run a **fullscreen local UI** (kiosk) on an attached monitor/keyboard.

Important:
- Virtual terminal switching only works **on the physical device** (attached monitor + keyboard).
- You cannot switch TTYs from a web browser. For remote access, use the WebUI/SSH instead.

If you boot and only see a text login prompt (tty1):
- The kiosk UI runs on **tty7**.
- On current versions, the system will usually switch to the kiosk UI automatically once it starts.
- tty1 also shows a banner with these shortcuts (useful if kiosk fails to start).
- Press `Ctrl+Alt+F7` to switch to the kiosk UI (sometimes `Fn+Ctrl+Alt+F7` on compact keyboards/laptops).
- If you try `Ctrl+Shift+F7`, it will **not** switch TTYs.
- To go back to the text console, press `Ctrl+Alt+F1`.

### Windows (Rufus) (recommended)

Rufus is the most reliable way to create a bootable 5tratumOS USB installer on Windows.

1) Download `5tratumos-installer-<version>-uefi.iso` **or** `5tratumos-installer-<version>-bios.iso` (from the release assets)
2) Download and run **Rufus** (Windows): https://rufus.ie
3) In Rufus:
   - **Device:** select your USB drive
   - **Boot selection:** select the ISO you downloaded
   - **Partition scheme:**
     - UEFI ISO: **GPT**
     - BIOS ISO: **MBR**
4) Click **Start** (this will erase the USB drive)
5) Boot the target machine from the USB drive and follow the installer prompts

If Rufus asks whether to write in **ISO Image mode** or **DD Image mode**, choose **DD Image mode**.

### Windows (Win32 Disk Imager / "WinImager")

1) Open **Win32 Disk Imager**
2) Select `5tratumos-installer-<version>.iso` (you may need to choose "*.* / All files")
3) Select the correct USB drive letter -> Write
4) Boot the target machine from the USB drive and follow the installer prompts
