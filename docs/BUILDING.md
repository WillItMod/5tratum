# Building 5tratumOS Artifacts

This repo publishes **release artifacts** (update bundles + hashes) for 5tratumOS.
The **installer ISO** is built from `WillItMod/5tratum_Build` and embeds the update bundle into a Debian netinst ISO.

## Proxmox build host

We typically build the installer ISO on the Proxmox host:

- Host: `192.168.1.254` (`root`)
- Proxmox ISO storage path: `/var/lib/vz/template/iso/`

## What gets embedded into the installer ISO

The Debian preseed installer ISO embeds these files under `/5tratumos/` on the ISO:

- `5tratumos-update.tgz` (the 5tratumOS payload)
- `build.json` (writes `/etc/5tratumos/build.json` so the UI shows the correct version)
- `update.token` (optional; writes `/etc/5tratumos/update.token` for private update repos)
- `preseed.cfg` + `late_command.sh` automation (installs the payload and enables services)

## Build the update bundle (release asset)

The update bundle is produced from the 5tratumOS source tree and published as:

- `5tratumos-update.tgz`
- `5tratumos-update.tgz.sha256`

In the build repo (`WillItMod/5tratum_Build`) on Windows:

```powershell
cd C:\VSC\5tratumOS
powershell -ExecutionPolicy Bypass -File .\scripts\build-update-bundle.ps1 -BuildTag vX.Y.Z
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

Example (build tag `vX.Y.Z`, output ISO named with the same tag):

```bash
cd /opt/5tratum_Build/5tratumOS

# Place the bundle under dist/
ls -la dist/5tratumos-update.tgz

# Optional: embed token for private update repo
ls -la /root/update.token

OS_TAG=vX.Y.Z \
OS_CHANNEL=main \
UPDATE_TOKEN_FILE=/root/update.token \
OUT_ISO=dist/5tratumos-installer-vX.Y.Z.iso \
BUNDLE_TGZ=dist/5tratumos-update.tgz \
  installer/build-debian-preseed-iso.sh

(cd dist && sha256sum 5tratumos-installer-vX.Y.Z.iso > 5tratumos-installer-vX.Y.Z.iso.sha256)
```

Copy into Proxmox ISO storage for VM testing:

```bash
cp -f dist/5tratumos-installer-vX.Y.Z.iso /var/lib/vz/template/iso/
cp -f dist/5tratumos-installer-vX.Y.Z.iso.sha256 /var/lib/vz/template/iso/
```

## Notes

- The ISO builder mirrors GRUB config to locations required by some USB/UEFI flows (Etcher-style raw writes).
- The installer `late_command.sh` runs inside the installed target (`in-target`) and is responsible for:
  - deploying `/opt/5tratumos/*`
  - writing `/etc/5tratumos/build.json`
  - seeding `/etc/5tratumos/update.token` (if provided)
  - enabling 5tratumOS systemd units
