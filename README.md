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

**AMD/INTEL only (x86_64 / amd64) for the installer ISO.**

- **AMD/INTEL installer ISO (v0.3.124)**
  - [Installer ISO](https://github.com/WillItMod/5tratum/releases/download/v0.3.124/5tratumos-installer-v0.3.124.iso)
  - [Installer ISO checksum](https://github.com/WillItMod/5tratum/releases/download/v0.3.124/5tratumos-installer-v0.3.124.iso.sha256)
- **Raspberry Pi (arm64) image (v0.3.122)**
  - [RPi image (.img.xz)](https://github.com/WillItMod/5tratum/releases/download/v0.3.122/5tratumos-raspios-trixie-arm64-lite-v0.3.122.img.xz)
  - [RPi image checksum](https://github.com/WillItMod/5tratum/releases/download/v0.3.122/5tratumos-raspios-trixie-arm64-lite-v0.3.122.img.xz.sha256)

## Requirements

- **USB drive:** 1GB minimum (2GB+ recommended)
- **RAM:** 16GB absolute minimum

This will not run on a potato. But it will run on a donut. Actually, it runs on donuts.

## Flashing / Install

- Full install guide: [docs/install/README.md](docs/install/README.md)
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
