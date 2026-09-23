# Docs

This repo publishes 5tratumOS **release artifacts** via GitHub Releases.

Current fresh-install downloads: Raspberry Pi **v0.8.10 (rpi1)** and AMD/Intel
**v0.8.7**.

- UEFI ISO: `https://github.com/WillItMod/5tratum/releases/download/v0.8.7/5tratumos-installer-v0.8.7-uefi.iso`
- Legacy BIOS ISO: `https://github.com/WillItMod/5tratum/releases/download/v0.8.7/5tratumos-installer-v0.8.7-bios.iso`
- Raspberry Pi arm64 image: `https://github.com/WillItMod/5tratum/releases/download/v0.8.10/5tratumos-raspios-lite-v0.8.10-arm64.img.xz`
- Raspberry Pi checksum: `https://github.com/WillItMod/5tratum/releases/download/v0.8.10/5tratumos-raspios-lite-v0.8.10-arm64.img.xz.sha256`
- Raspberry Pi release notes: `https://github.com/WillItMod/5tratum/releases/tag/v0.8.10`
- AMD/Intel checksums and release notes: `https://github.com/WillItMod/5tratum/releases/tag/v0.8.7`

The Raspberry Pi refresh embeds the v0.8.10 rollup with the ARM64 console
package correction. Physical Pi boot testing remains outstanding. See the
release notes for image provenance and validation.

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
