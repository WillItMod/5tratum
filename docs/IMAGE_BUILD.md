# Building a Flashable Image (Balena Etcher)

Goal: produce a clean, app-free 5tratumOS image with default configuration (no installed apps, no secrets) that can be written to a disk/SSD using Balena Etcher.

This should be done on a dedicated “golden image” VM, not on an in-use system.

## High-level approach
1) Provision a fresh Debian 12 (or Ubuntu Server 24.04) VM.
2) Run `bootstrap/install.sh` to install Docker + 5tratumOS services.
3) Do not install any apps.
4) Clean/reset machine-specific state.
5) Shut down, then convert the VM disk to a raw image for Etcher.

On first boot, the image will auto-expand the root filesystem (ext4) to fill the disk.

## Clean/reset checklist (do NOT run on an in-use machine)
- Remove installed app state:
  - `/var/lib/5tratumos/apps/*`
  - `/opt/5tratumos/apps/*`
- Remove machine-specific secrets you don’t want to ship (SSH host keys, etc.).
- Ensure `/etc/5tratumos/*.json` contains only defaults (no tokens).
- Reset web UI login so first boot prompts for setup:
  - Remove `/etc/5tratumos/auth.json`
  - `systemctl restart 5tratumosd`
- Bake in the update signing public key at `/etc/5tratumos/update_signing.pub` (optional but recommended).

## Performance tuning (recommended, safe defaults)

Run once on the golden image (as root):

```bash
sudo /opt/5tratumos/bootstrap/os-tune.sh
```

Optional ext4 tweak for the data volume (reserved blocks to 0% when `/srv/5tratumos-data` is ext4):

```bash
sudo FIVETRATUMOS_TUNE_DATA_EXT4=1 /opt/5tratumos/bootstrap/os-tune.sh
```

## Converting to an Etcher image
From a host with `qemu-img` (e.g., the Proxmox node or a Linux workstation):

```bash
# Example: convert qcow2 to raw
qemu-img convert -p -O raw input.qcow2 5tratumos-v0.3.32.img
```

Then write with Balena Etcher:
- Select `5tratumos-v0.3.32.img`
- Select target disk
- Flash

## USB installer vs “direct flash”
- Direct flash: Etcher writes the OS image straight to disk.
- USB installer: a bootable USB that runs an installer/flash tool (more work, but can be friendlier for end users).

For first test users, direct flash is usually simplest and most reliable.
