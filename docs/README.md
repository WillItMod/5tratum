# Docs

This repo publishes 5tratumOS **release artifacts** via GitHub Releases.

Current v0.8.7 fresh-install downloads:

- UEFI ISO: `https://github.com/WillItMod/5tratum/releases/download/v0.8.7/5tratumos-installer-v0.8.7-uefi.iso`
- Legacy BIOS ISO: `https://github.com/WillItMod/5tratum/releases/download/v0.8.7/5tratumos-installer-v0.8.7-bios.iso`
- Raspberry Pi arm64 image: `https://github.com/WillItMod/5tratum/releases/download/v0.8.7/5tratumos-raspios-lite-v0.8.7-arm64.img.xz`
- Checksums and release notes: `https://github.com/WillItMod/5tratum/releases/tag/v0.8.7`

Raspberry Pi image contents and filesystems were checked; physical Pi boot testing
remains outstanding. See the release notes for architecture-specific evidence.

Existing installations update through `Settings -> Updates`. The current
main-channel updater is v0.8.10 (DEV: v0.8.10-dev):

- [MAIN release](https://github.com/WillItMod/5tratum/releases/tag/v0.8.10)
- [DEV release](https://github.com/WillItMod/5tratum/releases/tag/v0.8.10-dev)
- [5tratMux licence backup and restore](LICENCE_RESTORE.md)

The `.tgz` payload is used by updates and by the Linux/Raspberry Pi installation
helpers. It is not bootable media.

- Install: [install/README.md](install/README.md)
- Firmware (BIOS/UEFI/Secure Boot): [install/FIRMWARE.md](install/FIRMWARE.md)
- Troubleshooting: [install/TROUBLESHOOTING.md](install/TROUBLESHOOTING.md)
- Verify downloads: [install/VERIFY.md](install/VERIFY.md)
- Hardware model guides: [hardware/README.md](hardware/README.md)
- Raspberry Pi: [rpi/README.md](rpi/README.md)

Related app docs:

- AxeSuite: `https://github.com/WillItMod/AxeSuite`
- 5tratStore: `https://github.com/WillItMod/5tratStore-global`
