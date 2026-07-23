# 5tratumOS

[![License: BUSL 1.1](https://img.shields.io/badge/license-BUSL%201.1-orange)](LICENSE)

5tratumOS is the host platform, WebUI, update surface, and install media for running the 5tratum/AxeSuite app family on dedicated hardware.

## License (READ THIS FIRST)

This project is licensed under the **Business Source License 1.1 (BSL 1.1)**. It is **NOT** an open source license.

- **No resale / no preinstalled devices / no "built nodes" without a commercial license:** [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md)
- **Forks/derivatives are NOT welcome for redistribution:** see [LICENSE_POLICY.md](LICENSE_POLICY.md)
- License: [LICENSE](LICENSE)
- Licensing policy summary: [LICENSE_POLICY.md](LICENSE_POLICY.md)
- Trademark/branding policy: [TRADEMARK.md](TRADEMARK.md)

## Downloads

### Current BETA release

`v0.5.8` is published as the current **BETA main-channel update release**:

- Release page: https://github.com/WillItMod/5tratum/releases/tag/v0.5.8
- Update bundle for existing installations: `5tratumos-update-v0.5.8.tgz`

Fresh-install media remains under `v0.5.00`. After installation, use the main
update channel to move to `v0.5.8`.

Use `Settings -> Updates` and select the **main** channel to pick up this release on an existing install.

### OS update bundle (existing installs)

- Updates are delivered via the WebUI: `Settings -> Updates -> Check updates`.
- Latest existing-install update: https://github.com/WillItMod/5tratum/releases/latest
- Full release history: https://github.com/WillItMod/5tratum/releases
- Repo tags: https://github.com/WillItMod/5tratum/tags

Notes:
- Use the **Releases** page for published update bundles and installer assets.
- Main-channel systems follow the latest non-prerelease update bundle.
- Dev-channel systems follow pre-releases/dev builds.
- The latest tag, latest dev pre-release, and latest main-channel release are not always the same thing.

### Installer media

**Installer ISOs are for AMD/Intel x86_64 hardware. Raspberry Pi uses the arm64 image.**

Installer ISOs and Raspberry Pi images are not attached to every release tag. If the newest stable tag does not include these assets, use the newest release that does.

- **Published assets live on the Releases page**
  - Current BETA media release: https://github.com/WillItMod/5tratum/releases/tag/v0.5.00
  - All releases: https://github.com/WillItMod/5tratum/releases
- **AMD/Intel installer ISO**
  - UEFI ISO: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-installer-v0.5.00-uefi.iso
  - UEFI checksum: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-installer-v0.5.00-uefi.iso.sha256
  - Legacy BIOS ISO: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-installer-v0.5.00-bios.iso
  - Legacy BIOS checksum: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-installer-v0.5.00-bios.iso.sha256
- **Raspberry Pi (arm64) image**
  - Image: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-raspios-lite-v0.5.00.img.xz
  - Checksum: https://github.com/WillItMod/5tratum/releases/download/v0.5.00/5tratumos-raspios-lite-v0.5.00.img.xz.sha256

The installer links above are complete bootable images. The `.tgz` assets in
newer releases are updater payloads for an existing 5tratumOS system and are not
fresh-install media.

## Related Projects

`5tratumOS` is the host platform and update surface. The app family and store matrix live alongside it:

- Axe app hub: https://github.com/WillItMod/AxeSuite
- Umbrel main store: https://github.com/WillItMod/umbrel-community-store
- Umbrel dev store: https://github.com/WillItMod/umbrel-dev-community-store

For the current app matrix, store coverage, and release/changelog pointers, see the AxeSuite docs.

## Requirements

- **x86 CPU:** 64-bit AMD/Intel processor. UEFI is recommended; legacy BIOS/CSM media is available for older systems.
- **x86 RAM:** 16GB minimum. 32GB+ is recommended if you run multiple full-node apps.
- **x86 storage:** SSD/NVMe strongly recommended. 1TB minimum for serious use; 2TB+ recommended for multiple chains/apps.
- **Raspberry Pi:** Raspberry Pi 4/5, 64-bit arm64. 8GB RAM is recommended.
- **Raspberry Pi storage:** 64GB microSD/SSD minimum for the OS; external SSD/NVMe is recommended for app data and chain storage.
- **Network:** Wired Ethernet is strongly recommended for mining/node workloads.
- **Installer USB:** 2GB+ USB drive for ISO installs.

Actual app requirements vary by chain and workload. Full nodes and multi-app fleets need more RAM, disk, and sustained cooling than a basic dashboard-only test install.

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
  - Local console on x86 installs: press `Ctrl+Alt+F1` and run `ip a`
- SSH on x86 ISO installs:
  - Username: `forge`
  - Password: `5tratum`
- SSH on Raspberry Pi images:
  - Create/enable the SSH user in Raspberry Pi Imager OS Customisation before flashing, or use a local keyboard/monitor.

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
2) Select `5tratumos-installer-<version>-uefi.iso` or `5tratumos-installer-<version>-bios.iso` (you may need to choose "*.* / All files")
3) Select the correct USB drive letter -> Write
4) Boot the target machine from the USB drive and follow the installer prompts
