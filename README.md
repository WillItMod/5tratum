# 5tratumOS (starter)

This folder is a first-pass "appliance OS" foundation for running AxeSuite apps:

- Base: Ubuntu/Debian VM (Proxmox-friendly)
- Runtime: Docker Engine + Docker Compose v2
- Overlay: a small landing page on port `80`
- Apps: templated Docker Compose stacks (currently `axelive`, `axebench`)

Note: the CLI/service names are still `forgeos` for now (rebrand-friendly, can be renamed later).

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

This enables `forgeos-console@forge.service` (change user via `FORGEOS_CONSOLE_USER=<user>`).

Install/start apps:

```bash
sudo forgeos store sync
sudo forgeos app available
sudo forgeos app install axelive
sudo forgeos app up axelive
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
sudo forgeos channel set main
sudo forgeos channel set dev
```

Or per install:

```bash
sudo forgeos app install axelive --channel dev
```

## OS updates (self-update)

5tratumOS can self-update from a **public release feed** (default: `WillItMod/5tratum` GitHub Releases).

- MAIN channel: latest non-prerelease (`/releases/latest`)
- DEV channel: latest prerelease

### Publish an update bundle

From the private build repo (this repo), create a bundle:

```bash
./scripts/build-update-bundle.sh
```

Then create a GitHub Release in `WillItMod/5tratum` and upload:

- `dist/5tratumos-update.tgz`
- `dist/5tratumos-update.tgz.sha256`

### Apply on a device

In the UI: `Settings → Updates → Check updates → Update`.

If the update repo is private, set a GitHub token in `Settings → Updates` (fine‑grained PAT with read access).
