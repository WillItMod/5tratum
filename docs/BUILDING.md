# Building 5tratumOS Artifacts

This repo publishes **release artifacts** (update bundles, installer ISOs, Raspberry Pi images, and hashes) for 5tratumOS.
The installer media is built from `WillItMod/5tratum_Build` and embeds the update bundle into Debian/Raspberry Pi OS install media.

## Build host

Build media on a Debian/Ubuntu host or VM with enough free disk space for extracted images and ISO work directories. The Raspberry Pi image builder requires Linux loop devices and mount support.

## What gets embedded into the installer media

The Debian preseed installer ISO embeds these files under `/5tratumos/` on the ISO:

- `5tratumos-update.tgz` and its required `.sha256` (the 5tratumOS payload)
- `build.json` (must agree with the embedded payload; writes `/etc/5tratumos/build.json` so the UI shows the correct version)
- `update.token` (optional; writes `/etc/5tratumos/update.token` for private update repos)
- `preseed.cfg` + `late_command.sh` automation (installs the payload and enables services)

The Raspberry Pi image embeds the update bundle on the boot partition and enables a one-shot firstboot systemd service that installs 5tratumOS, writes build metadata, enables the kiosk console, and reboots.

## Build the update bundle (release asset)

The update bundle is produced from the 5tratumOS source tree and published as:

- `5tratumos-update.tgz`
- `5tratumos-update.tgz.sha256`
- `5tratumos-update-vX.Y.Z.tgz` (an identical versioned copy)
- `5tratumos-update-vX.Y.Z.tgz.sha256`

This is also the installation bundle: it already contains `bootstrap/install.sh`,
`systemd/`, `bin/`, `daemon/`, `overlay/`, `apps-available/` and `console/`.
Do not substitute a GitHub source archive or assemble a smaller payload that
omits the current installer, signed catalogue or optional-feature metadata.
Model weights and optional MUXFLIGHT files stay outside the OS archive.

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
TRATUMOS_TAG=vX.Y.Z TRATUMOS_CHANNEL=main \
  TRATUMOS_UPDATE_REPO=WillItMod/5tratum \
  ./scripts/build-update-bundle.sh
```

Use the release record's exact MUX updater, target version, signed catalogue
and optional-runtime metadata inputs when building the bundle. In particular,
do not rely on an older default MUX recovery target or omit the signed optional
catalogue inputs. The examples above show the general invocation; the release
record supplies the complete environment for the frozen source.

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

The ISO builder checks the Debian base ISO against its pinned SHA-256. An
alternate or cached base requires the matching `DEBIAN_ISO_SHA256` alongside
`DEBIAN_ISO` or `DEBIAN_ISO_URL`. `OS_TAG` and `OS_CHANNEL` must match the
embedded bundle; naming a file does not change its installed version.

## Build the Raspberry Pi image

```bash
TRATUMOS_TAG=vX.Y.Z TRATUMOS_CHANNEL=main \
  BASE_IMG_XZ=/path/to/raspios-lite-arm64.img.xz \
  BASE_IMG_URL=https://downloads.raspberrypi.com/PINNED-IMAGE-PATH.img.xz \
  BASE_IMG_VERSION=EXACT-UPSTREAM-IMAGE-VERSION \
  BASE_IMG_SHA256=EXACT-UPSTREAM-SHA256 \
  BUNDLE_TGZ=dist/5tratumos-update.tgz \
  OUT_IMG_XZ=dist/5tratumos-raspios-lite-vX.Y.Z-arm64.img.xz \
  bash installer/build-raspios-image.sh
```

## Notes

- The ISO builder mirrors GRUB config to locations required by some USB/UEFI flows (Etcher-style raw writes).
- The installer `late_command.sh` runs inside the installed target (`in-target`) and is responsible for:
  - deploying `/opt/5tratumos/*`
  - writing `/etc/5tratumos/build.json`
  - seeding `/etc/5tratumos/update.token` (if provided)
  - enabling 5tratumOS systemd units

## Release preparation and evidence

For the 0.8.7 preparation, keep candidate files labeled `v0.8.7-rc1` until the
release decision. `INSTALL_TAG=v0.8.7-rc1` selects that candidate in the helpers;
for unpublished QA, provide the exact candidate archive as `BUNDLE_URL` with a
matching `.sha256` at the adjacent URL. A missing checksum or failed download
must stop installation rather than select another payload. Public helper defaults are `v0.8.7`; publish helper changes together with the
tested assets.

Record the source commit and any source patch, bundle SHA-256, signed catalogue
identity, upstream base URL/version/SHA-256, build-host architecture, builder
arguments and output hashes. Save the same bundle bytes in both ISO variants and
the Raspberry Pi image. Versioned bundle aliases must be byte-identical, with
checksum sidecars naming the corresponding alias. Retain the input archives so
the build can be repeated; timestamps in generated metadata and archive files
mean byte-for-byte reproducibility is not currently guaranteed.

Before public upload, install the candidate ISO onto a new disposable VM, detach
the ISO and reboot, then check installed version, app catalogue, update channels,
required services, network and rendered UI. Record BIOS and UEFI coverage
separately. Raspberry Pi evidence must distinguish ARM64 static checks,
emulation and an actual physical Pi boot. Do not replace earlier release assets.
