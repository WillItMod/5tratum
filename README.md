# 5tratumOS (starter)

This folder is a first-pass "appliance OS" foundation for running AxeSuite apps:

- Base: Ubuntu/Debian VM (Proxmox-friendly)
- Runtime: Docker Engine + Docker Compose v2
- Overlay: a small landing page on port `80`
- Apps: templated Docker Compose stacks (currently `axelive`, `axebench`)

License: see `LICENSE` (AGPL-3.0).
Branding: see `TRADEMARK.md`.

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

Then create a GitHub Release in `WillItMod/5tratum` and upload:

- `dist/5tratumos-update.tgz`
- `dist/5tratumos-update.tgz.sha256`
- `dist/5tratumos-update.tgz.sig` (if signing enabled)

### Apply on a device

In the UI: `Settings -> Updates -> Check updates -> Update`.

If the update repo is private, set a GitHub token in `Settings -> Updates` (fine-grained PAT with read access).

## Building a flashable image (Etcher)

To produce a clean, app-free disk image suitable for Balena Etcher, see:

- `docs/IMAGE_BUILD.md`
