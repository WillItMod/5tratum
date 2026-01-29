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
- Latest MAIN update bundle: **v0.3.186** (assets: `5tratumos-update.tgz` + `.sha256`)
  - https://github.com/WillItMod/5tratum/releases/tag/v0.3.186

### Installer media

**AMD/INTEL only (x86_64 / amd64) for the installer ISO.**

Installer ISOs and Raspberry Pi images are **not attached to every release tag**. If the newest tag does not include these assets, use the **newest tag that does**.

- **AMD/INTEL installer ISO (latest published: v0.3.186)**
  - UEFI-only (recommended):
    - [Installer ISO](https://github.com/WillItMod/5tratum/releases/download/v0.3.186/5tratumos-installer-v0.3.186-uefi.iso)
    - [Installer ISO checksum](https://github.com/WillItMod/5tratum/releases/download/v0.3.186/5tratumos-installer-v0.3.186-uefi.iso.sha256)
  - Legacy BIOS-only (older hardware / CSM):
    - [Installer ISO](https://github.com/WillItMod/5tratum/releases/download/v0.3.186/5tratumos-installer-v0.3.186-bios.iso)
    - [Installer ISO checksum](https://github.com/WillItMod/5tratum/releases/download/v0.3.186/5tratumos-installer-v0.3.186-bios.iso.sha256)
- **Raspberry Pi (arm64) image (latest published: v0.3.184)**
  - [RPi image (.img.xz)](https://github.com/WillItMod/5tratum/releases/download/v0.3.184/5tratumos-raspios-lite-v0.3.184.img.xz)
  - [RPi image checksum](https://github.com/WillItMod/5tratum/releases/download/v0.3.184/5tratumos-raspios-lite-v0.3.184.img.xz.sha256)

## Requirements

- **USB drive:** 1GB minimum (2GB+ recommended)
- **RAM:** 16GB absolute minimum

This will not run on a potato. But it will run on a donut. Actually, it runs on donuts.

## Flashing / Install

- Full install guide: [docs/install/README.md](docs/install/README.md)
- Firmware (BIOS/UEFI/Secure Boot) prerequisites: [docs/install/FIRMWARE.md](docs/install/FIRMWARE.md)
- Install/boot troubleshooting (common problems): [docs/install/TROUBLESHOOTING.md](docs/install/TROUBLESHOOTING.md)
- Model-specific BIOS/UEFI guides: [docs/hardware/README.md](docs/hardware/README.md)
- Verify downloads: [docs/install/VERIFY.md](docs/install/VERIFY.md)
- Raspberry Pi: [docs/rpi/README.md](docs/rpi/README.md)

### Windows (Balena Etcher)

1) Download `5tratumos-installer-<version>.iso` (from the release assets)
2) Open **Balena Etcher** -> "Flash from file" -> select `5tratumos-installer-<version>.iso`
3) Select your USB drive -> Flash
4) Boot the target machine from the USB drive and follow the installer prompts

### Windows (Win32 Disk Imager / "WinImager")

1) Open **Win32 Disk Imager**
2) Select `5tratumos-installer-<version>.iso` (you may need to choose "*.* / All files")
3) Select the correct USB drive letter -> Write
4) Boot the target machine from the USB drive and follow the installer prompts
