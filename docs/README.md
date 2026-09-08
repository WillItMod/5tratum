# Docs

This repo publishes 5tratumOS **release artifacts** via GitHub Releases.

Current v0.8.6 fresh-install downloads:

- UEFI ISO: `https://github.com/WillItMod/5tratum/releases/download/v0.8.6/5tratumos-installer-v0.8.6-uefi.iso`
- Legacy BIOS ISO: `https://github.com/WillItMod/5tratum/releases/download/v0.8.6/5tratumos-installer-v0.8.6-bios.iso`
- Raspberry Pi arm64 image: `https://github.com/WillItMod/5tratum/releases/download/v0.8.6/5tratumos-raspios-lite-v0.8.6-arm64.img.xz`
- Checksums and release notes: `https://github.com/WillItMod/5tratum/releases/tag/v0.8.6`

Raspberry Pi image contents and filesystems were checked; physical Pi boot testing
remains outstanding. See the release notes for architecture-specific evidence.

Existing installations update through `Settings -> Updates`. The current
main-channel updater is v0.8.6:

- `https://github.com/WillItMod/5tratum/releases/tag/v0.8.6`

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
- Umbrel main store: `https://github.com/WillItMod/umbrel-community-store`
- Umbrel dev store: `https://github.com/WillItMod/umbrel-dev-community-store`
