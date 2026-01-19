# 5tratumOS Releases

Release artifacts are published via GitHub Releases.

- Install guide: `docs/install/README.md`
- Verify downloads: `docs/install/VERIFY.md`

## v0.3.64 downloads

Burn the ISO image to a usb drive, then use this to plug in to your target machine for installation. Boot from the USB drive.
1GB minimum recommended.

- Installer ISO (recommended): `https://github.com/WillItMod/5tratum/releases/download/v0.3.64/5tratumos-installer.iso`
- Installer ISO checksum: `https://github.com/WillItMod/5tratum/releases/download/v0.3.64/5tratumos-installer.iso.sha256`
- Proxmox vma backup: 'https://github.com/WillItMod/5tratum/releases/download/v0.3.64/5tratumOS_v0.3.64_Proxmox.vma.zst'

Proxmox backup / installation
Copy the .vma or .vma.zst file to the Proxmox server
Put it in
/var/lib/vz/dump/
or upload it to a storage that allows Backups.

Open Proxmox web UI
Datacenter → Storage → select the storage → Content
You should see the VMA listed as a backup.

Restore the VMA
Click the backup → Restore

Choose restore options

Target node: your Proxmox server

VM ID: pick a free number

Storage: where the VM disks should live

Leave defaults unless you know you need changes

Click Restore
Wait for it to finish.

Start the VM
The VM now appears in the left tree. Click it → Start.
