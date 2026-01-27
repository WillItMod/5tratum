## Deploying to a running 5tratumOS host

This repo includes a simple Windows PowerShell deploy script that can push the **portal overlay** and/or the **daemon** to a remote host over SSH.

## Raspberry Pi (Debian/RPi Lite) one-shot install

On a Raspberry Pi already running a Debian/Raspbian-based minimal image, you can install 5tratumOS via a single script:

```bash
curl -fsSL https://raw.githubusercontent.com/WillItMod/5tratum/main/scripts/install-rpi.sh | sudo bash
```

Optional: provide a GitHub token for private update repos (saved to `/etc/5tratumos/update.token`):

```bash
curl -fsSL https://raw.githubusercontent.com/WillItMod/5tratum/main/scripts/install-rpi.sh | sudo UPDATE_TOKEN='ghp_...' bash
```

### Prerequisites

- SSH access to the host (key-based auth recommended).
- On the host, allow passwordless `sudo` for the deploy commands (recommended):
  - `/bin/mkdir`, `/bin/cp`, `/bin/systemctl`, and `tar`

### Deploy from Windows

From an elevated PowerShell (run from the repo root):

- Portal only: `powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1 -Target portal`
- Daemon only: `powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1 -Target daemon`
- Both: `powershell -ExecutionPolicy Bypass -File scripts\deploy.ps1 -Target all`

Optional parameters:

- `-RemoteHost 10.10.10.91`
- `-RemoteUser admin`
- `-IdentityFile C:\Users\<you>\.ssh\id_5tratumos`

The script streams a `tar` archive over `ssh` and restarts the relevant systemd unit(s).
