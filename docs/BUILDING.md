# Building 5tratumOS Artifacts

This repo publishes **release artifacts** (update bundles, installer ISOs, Raspberry Pi images, and hashes) for 5tratumOS.
The installer media is built from `WillItMod/5tratum_Build` and embeds the update bundle into Debian/Raspberry Pi OS install media.

## Build host

Build media on a Debian/Ubuntu host or VM with enough free disk space for extracted images and ISO work directories. The Raspberry Pi image builder requires Linux loop devices and mount support.

## What gets embedded into the installer media

The Debian preseed installer ISO embeds these files under `/5tratumos/` on the ISO:

- `5tratumos-update.tgz` (the 5tratumOS payload)
- `build.json` (writes `/etc/5tratumos/build.json` so the UI shows the correct version)
- `update.token` (optional; writes `/etc/5tratumos/update.token` for private update repos)
- `preseed.cfg` + `late_command.sh` automation (installs the payload and enables services)

The Raspberry Pi image embeds the update bundle on the boot partition and enables a one-shot firstboot systemd service that installs 5tratumOS, writes build metadata, enables the kiosk console, and reboots.

## Build the update bundle (release asset)

The update bundle is produced from the 5tratumOS source tree and published as:

- `5tratumos-update.tgz`
- `5tratumos-update.tgz.sha256`

In the build repo (`WillItMod/5tratum_Build`) on Windows:

```powershell
cd C:\VSC\5tratumOS
# MAIN bundle
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-update-bundle.ps1 -BuildTag vX.Y.Z -Channel main -UpdateRepo WillItMod/5tratum

# DEV / prerelease bundle
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-update-bundle.ps1 -BuildTag vX.Y.Z -Channel dev -UpdateRepo WillItMod/5tratum
```

Or on Linux:

```bash
./scripts/build-update-bundle.sh
```

## Build the Debian preseed installer ISO (Proxmox / Debian)

On the Proxmox host (or a Debian VM), use the build repo (`WillItMod/5tratum_Build`) which contains:

- `installer/build-debian-preseed-iso.sh`
- `installer/debian-installer/preseed.cfg`
- `installer/debian-installer/late_command.sh`

Example (build tag `vX.Y.Z`, output ISOs named with the same tag):

```bash
cd /opt/5tratum_Build/5tratumOS

# Place the bundle under dist/
ls -la dist/5tratumos-update.tgz

# Optional: embed token for private update repo
ls -la /root/update.token

OS_TAG=vX.Y.Z OS_CHANNEL=main BOOT_MODE=uefi \
  OUT_ISO=dist/5tratumos-installer-vX.Y.Z-uefi.iso \
  BUNDLE_TGZ=dist/5tratumos-update.tgz \
  bash installer/build-debian-preseed-iso.sh

OS_TAG=vX.Y.Z OS_CHANNEL=main BOOT_MODE=bios \
  OUT_ISO=dist/5tratumos-installer-vX.Y.Z-bios.iso \
  BUNDLE_TGZ=dist/5tratumos-update.tgz \
  bash installer/build-debian-preseed-iso.sh
```

## Build the Raspberry Pi image

```bash
TRATUMOS_TAG=vX.Y.Z TRATUMOS_CHANNEL=main \
  BASE_IMG_XZ=/path/to/raspios-lite-arm64.img.xz \
  BUNDLE_TGZ=dist/5tratumos-update.tgz \
  OUT_IMG_XZ=dist/5tratumos-raspios-lite-vX.Y.Z.img.xz \
  bash installer/build-raspios-image.sh
```

## Notes

- The ISO builder mirrors GRUB config to locations required by some USB/UEFI flows (Etcher-style raw writes).
- The installer `late_command.sh` runs inside the installed target (`in-target`) and is responsible for:
  - deploying `/opt/5tratumos/*`
  - writing `/etc/5tratumos/build.json`
  - seeding `/etc/5tratumos/update.token` (if provided)
  - enabling 5tratumOS systemd units
