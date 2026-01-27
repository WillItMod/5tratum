# 5tratumOS (Build / OS source)

This repo builds the 5tratumOS update bundle consumed by running devices via GitHub Releases (`WillItMod/5tratum`).

It is an "appliance OS" foundation for running AxeSuite apps:

- Base: Ubuntu/Debian VM (Proxmox-friendly)
- Runtime: Docker Engine + Docker Compose v2
- Overlay: a small landing page on port `80`
- Apps: templated Docker Compose stacks (currently `axelive`, `axebench`)

License: see `LICENSE` (BUSL-1.1). No resale / no "built nodes" without a commercial license: `COMMERCIAL_LICENSE.md`.
Branding: see `TRADEMARK.md`.
Policy: see `LICENSE_POLICY.md` (forks/derivatives not welcome for redistribution).

## Proxmox approach (recommended)

1) Create a fresh VM (Ubuntu Server 24.04 LTS or Debian 12), enable SSH, and make sure you can `ssh` in.
2) Provision it using either the **bootstrap script** (run inside the VM) or **Ansible** (run from your workstation).
3) In Proxmox, convert the VM to a **template** and clone it for deployments.

## Option A: Bootstrap inside the VM

```bash
git clone <YOUR_REPO_URL> 5tratumos
cd 5tratumos
sudo ./bootstrap/install.sh
```

Then open:
- Overlay: `http://<host>:80`

## Optional: Local HDMI/Console "Desktop" (kiosk)

On a device with a GPU/DRM console (`/dev/dri/card0`), you can boot straight into a fullscreen 5tratumOS UI:

```bash
sudo ./console/install.sh
```

This enables `5tratumos-console@forge.service` (change user via `FIVETRATUMOS_CONSOLE_USER=<user>` or `TRATUMOS_CONSOLE_USER=<user>`).

Install/start apps:

```bash
sudo 5tratumos store sync
sudo 5tratumos app available
sudo 5tratumos app install axelive
sudo 5tratumos app up axelive
```

## Option B: Ansible from your workstation

From `provision/ansible`:

```bash
cp inventory.example.ini inventory.ini
# edit inventory.ini (IP + ssh user)
ansible-playbook -i inventory.ini site.yml
```

## Channels (MAIN/DEV)

Set the default channel (used for choosing app templates under `apps-available/<channel>/...`):

```bash
sudo 5tratumos channel set main
sudo 5tratumos channel set dev
```

Or per install:

```bash
sudo 5tratumos app install axelive --channel dev
```

## OS updates (self-update)

5tratumOS can self-update from a release feed (default: `WillItMod/5tratum` GitHub Releases).

- MAIN: latest non-prerelease (`/releases/latest`)
- DEV: latest prerelease

Signed update support: `docs/UPDATE_SIGNING.md`.

### Publish an update bundle

From the private build repo (this repo), create a bundle:

```bash
./scripts/build-update-bundle.sh
```

Windows PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\build-update-bundle.ps1 -BuildTag v0.x.y -Channel main -UpdateRepo WillItMod/5tratum
```

Then create a GitHub Release in `WillItMod/5tratum` and upload:

- `dist/5tratumos-update.tgz`
- `dist/5tratumos-update.tgz.sha256`
- `dist/5tratumos-update.tgz.sig` (if signing enabled)

Tag naming / channels:
- MAIN: `vX.Y.Z` (no `-dev`) and **not** marked prerelease
- DEV: `vX.Y.Z-dev` and marked prerelease

Full checklist: `docs/RELEASE_PROCESS.md`.

### Apply on a device

In the UI: `Settings -> Updates -> Check updates -> Update`.

If the update repo is private, set a GitHub token in `Settings -> Updates` (fine-grained PAT with read access).

## Building a flashable image (Etcher)

To produce a clean, app-free disk image suitable for Balena Etcher, see:

- `docs/IMAGE_BUILD.md`
