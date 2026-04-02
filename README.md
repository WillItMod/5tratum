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
- Current published release assets: https://github.com/WillItMod/5tratum/releases/latest
- Full release history: https://github.com/WillItMod/5tratum/releases
- Repo tags (often newer than the latest published release page entry): https://github.com/WillItMod/5tratum/tags

Notes:
- Use the **Releases** page for published update bundles and installer assets.
- Use the **Tags** page when you need to inspect the current tag train.
- The latest published release and the latest tag are not always the same thing.

### Installer media

**AMD/INTEL only (x86_64 / amd64) for the installer ISO.**

Installer ISOs and Raspberry Pi images are **not attached to every release tag**. If the newest tag does not include these assets, use the **newest tag that does**.

- **Published assets live on the Releases page**
  - Latest published release: https://github.com/WillItMod/5tratum/releases/latest
  - All releases: https://github.com/WillItMod/5tratum/releases
- **AMD/INTEL installer ISO**
  - Download the newest release that includes:
    - `5tratumos-installer-<version>-uefi.iso`
    - `5tratumos-installer-<version>-bios.iso`
- **Raspberry Pi (arm64) image**
  - Download the newest release that includes:
    - `5tratumos-raspios-lite-<version>.img.xz`
    - the matching `.sha256`

## Related Projects

`5tratumOS` is the host platform and update surface. The app family and store matrix live alongside it:

- Axe app hub: https://github.com/WillItMod/AxeSuite
- Umbrel main store: https://github.com/WillItMod/umbrel-community-store
- Umbrel dev store: https://github.com/WillItMod/umbrel-dev-community-store

For the current app matrix, store coverage, and release/changelog pointers, see the AxeSuite docs.

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
