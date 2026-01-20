# 5tratumOS (Installer & Releases)

## License (READ THIS FIRST)

This project is licensed under the **Business Source License 1.1 (BSL 1.1)**. It is **NOT** an open source license.

- License: `LICENSE`
- Licensing policy summary: `LICENSE_POLICY.md`
- Trademark/branding policy: `TRADEMARK.md`

## Downloads (v0.3.89)

**AMD/INTEL only (x86_64 / amd64).** No ARM/Raspberry Pi builds in this release.

- Installer ISO: `https://github.com/WillItMod/5tratum/releases/download/v0.3.89/5tratumos-installer.iso`
- Installer ISO checksum: `https://github.com/WillItMod/5tratum/releases/download/v0.3.89/5tratumos-installer.iso.sha256`

## Requirements

- **USB drive:** 1GB minimum (2GB+ recommended)
- **RAM:** 16GB absolute minimum

This will not run on a potato. But it will run on a donut. Actually, it runs on donuts.

## Flashing / Install

- Full install guide: `docs/install/README.md`
- Verify downloads: `docs/install/VERIFY.md`

### Windows (Balena Etcher)

1) Download `5tratumos-installer.iso`
2) Open **Balena Etcher** -> "Flash from file" -> select `5tratumos-installer.iso`
3) Select your USB drive -> Flash
4) Boot the target machine from the USB drive and follow the installer prompts

### Windows (Win32 Disk Imager / "WinImager")

1) Open **Win32 Disk Imager**
2) Select `5tratumos-installer.iso` (you may need to choose "*.* / All files")
3) Select the correct USB drive letter -> Write
4) Boot the target machine from the USB drive and follow the installer prompts
