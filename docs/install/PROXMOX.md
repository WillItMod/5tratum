# Install 5tratumOS in a Proxmox LXC

The Proxmox helper creates a dedicated **unprivileged Debian LXC** and installs
5tratumOS inside that guest. It may download the selected Debian template into
Proxmox storage, but it does not install Docker, nodes, miners or 5tratumOS
services on the Proxmox VE host.

## Quick start

Open the Proxmox shell, or connect to the Proxmox VE host over SSH as `root`,
then run:

```sh
curl -fsSL https://raw.githubusercontent.com/WillItMod/5tratum/main/scripts/install-proxmox.sh | bash
```

The default deployment uses:

- the next available VMID
- hostname `5tratumos`
- the newest available Debian 12 or Debian 13 template
- an unprivileged LXC with nesting, keyctl and FUSE enabled
- `vmbr0` with DHCP and the Proxmox firewall enabled
- 4 CPU cores, 8 GiB RAM, 2 GiB swap and a 128 GiB root disk
- automatic guest startup with the Proxmox host

The helper selects active LXC storage automatically, downloads the Debian
template when necessary, creates the guest, and runs the supported Linux
installer inside it.

## Static address and custom resources

Download the helper before using custom options:

```sh
curl -fsSL https://raw.githubusercontent.com/WillItMod/5tratum/main/scripts/install-proxmox.sh -o /root/install-proxmox.sh
chmod 700 /root/install-proxmox.sh
bash /root/install-proxmox.sh \
  --vmid 180 \
  --hostname 5tratumos \
  --storage local-lvm \
  --bridge vmbr0 \
  --ip 192.168.1.80/24 \
  --gateway 192.168.1.1 \
  --disk-gb 512 \
  --cores 8 \
  --memory-mb 16384
```

Run `bash /root/install-proxmox.sh --help` for every option.

## Requirements

- Proxmox VE with a Debian 12 or Debian 13 LXC template available through
  `pveam`
- an active storage target supporting LXC root disks
- an active template storage target (normally `local`)
- a Linux bridge (normally `vmbr0`)
- outbound HTTPS and Debian package-repository access
- enough storage and memory for the 5tratumOS apps you intend to install

The helper requires at least 2 CPU cores, 4 GiB RAM and a 32 GiB root disk.
Those validation floors are suitable only for testing the platform. Full-node
apps generally need substantially more memory and SSD/NVMe storage.

## What runs where

Proxmox VE remains the hypervisor and host operating system. The helper creates
a Debian guest without changing that host role. Inside the guest, 5tratumOS
runs above the Debian/Linux foundation as the dashboard, app store, update
surface and container-management layer.

Docker and application containers run only inside the LXC. The helper enables
the Proxmox LXC features required for nested containers, sets the guest to
start automatically, and enables the Proxmox firewall flag on its virtual
network interface.

## After installation

The helper prints the guest address when DHCP has assigned one. Open:

```text
http://GUEST_IP/
```

If no address is printed, check the DHCP lease or run:

```sh
pct exec VMID -- hostname -I
```

Use a DHCP reservation or the static-address example if this guest will run
nodes and mining services.

## Troubleshooting

Inspect the guest without changing it:

```sh
pct status VMID
pct config VMID
pct exec VMID -- systemctl status 5tratumosd.service --no-pager
pct exec VMID -- journalctl -u 5tratumosd.service -n 100 --no-pager
```

If guest creation succeeds but installation fails, the helper leaves the LXC
in place for inspection. It never destroys an existing VM or container, and it
refuses to reuse an occupied VMID.
