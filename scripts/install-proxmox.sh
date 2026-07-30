#!/usr/bin/env bash
set -Eeuo pipefail

readonly INSTALL_REPOSITORY="WillItMod/5tratum"
readonly DEFAULT_INSTALL_REF="main"

usage() {
  cat <<'EOF'
Usage: bash install-proxmox.sh [options]

Create a dedicated, unprivileged Debian LXC on Proxmox VE and install
5tratumOS inside it. Docker and 5tratumOS services run only in the guest.

Options:
  --vmid ID                   Container ID (default: next free ID)
  --hostname NAME             Guest hostname (default: 5tratumos)
  --storage NAME              LXC root-disk storage (default: auto-detect)
  --template-storage NAME     Template storage (default: local)
  --bridge NAME               Network bridge (default: vmbr0)
  --ip dhcp|CIDR              Guest IPv4 configuration (default: dhcp)
  --gateway IP                Gateway for a static address
  --disk-gb N                 Root-disk size (default: 128)
  --cores N                   CPU cores (default: 4)
  --memory-mb N               Memory in MiB (default: 8192)
  --swap-mb N                 Swap in MiB (default: 2048)
  --channel NAME              5tratumOS update channel (default: main)
  --install-tag TAG           Bundle tag or latest (default: latest)
  -h, --help                  Show this help

The helper prefers the newest Debian 12 or Debian 13 template available for
the host architecture. Use a dedicated guest and increase disk/memory for
full-node workloads.
EOF
}

die() {
  echo "error: $*" >&2
  exit 1
}

vmid=""
guest_hostname="5tratumos"
root_storage=""
template_storage="local"
bridge="vmbr0"
ip_config="dhcp"
gateway=""
disk_gb="128"
cores="4"
memory_mb="8192"
swap_mb="2048"
channel="main"
install_tag="latest"
install_ref="${INSTALL_REF:-$DEFAULT_INSTALL_REF}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --vmid) vmid="${2:-}"; shift 2 ;;
    --hostname) guest_hostname="${2:-}"; shift 2 ;;
    --storage) root_storage="${2:-}"; shift 2 ;;
    --template-storage) template_storage="${2:-}"; shift 2 ;;
    --bridge) bridge="${2:-}"; shift 2 ;;
    --ip) ip_config="${2:-}"; shift 2 ;;
    --gateway) gateway="${2:-}"; shift 2 ;;
    --disk-gb) disk_gb="${2:-}"; shift 2 ;;
    --cores) cores="${2:-}"; shift 2 ;;
    --memory-mb) memory_mb="${2:-}"; shift 2 ;;
    --swap-mb) swap_mb="${2:-}"; shift 2 ;;
    --channel) channel="${2:-}"; shift 2 ;;
    --install-tag) install_tag="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

[[ "${EUID:-$(id -u)}" -eq 0 ]] ||
  die "run this helper as root in the Proxmox VE shell"

for command_name in pveversion pvesh pveam pvesm pct qm curl awk grep sort tail dpkg ip; do
  command -v "$command_name" >/dev/null 2>&1 ||
    die "missing required Proxmox command: $command_name"
done

for integer_value in "$disk_gb" "$cores" "$memory_mb" "$swap_mb"; do
  [[ "$integer_value" =~ ^[0-9]+$ ]] ||
    die "disk, core, memory and swap values must be whole numbers"
done
(( disk_gb >= 32 )) || die "--disk-gb must be at least 32"
(( cores >= 2 )) || die "--cores must be at least 2"
(( memory_mb >= 4096 )) || die "--memory-mb must be at least 4096"

[[ "$guest_hostname" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]{0,62}$ ]] ||
  die "--hostname is invalid"
[[ "$channel" =~ ^[a-zA-Z0-9][a-zA-Z0-9._-]*$ ]] ||
  die "--channel is invalid"
[[ "$install_tag" == "latest" || "$install_tag" =~ ^v[0-9A-Za-z][0-9A-Za-z._-]*$ ]] ||
  die "--install-tag is invalid"
[[ "$install_ref" =~ ^[0-9A-Za-z][0-9A-Za-z._/-]*$ ]] ||
  die "INSTALL_REF is invalid"

if [[ "$ip_config" != "dhcp" && "$ip_config" != */* ]]; then
  die "--ip must be dhcp or an IPv4 CIDR such as 192.168.1.80/24"
fi
if [[ "$ip_config" == "dhcp" && -n "$gateway" ]]; then
  die "--gateway is only valid with a static --ip"
fi

ip link show "$bridge" >/dev/null 2>&1 ||
  die "network bridge $bridge does not exist"

if [[ -z "$vmid" ]]; then
  vmid="$(pvesh get /cluster/nextid)"
fi
[[ "$vmid" =~ ^[0-9]+$ ]] || die "--vmid must be numeric"
if pct status "$vmid" >/dev/null 2>&1 || qm status "$vmid" >/dev/null 2>&1; then
  die "VMID $vmid already exists"
fi

if [[ -z "$root_storage" ]]; then
  root_storage_status="$(pvesm status -content rootdir)"
  for preferred_storage in local-lvm local-zfs local; do
    if awk -v name="$preferred_storage" \
      'NR > 1 && $1 == name && $3 == "active" {found=1} END {exit !found}' \
      <<<"$root_storage_status"; then
      root_storage="$preferred_storage"
      break
    fi
  done
  if [[ -z "$root_storage" ]]; then
    root_storage="$(
      awk 'NR > 1 && $3 == "active" {print $1; exit}' \
        <<<"$root_storage_status"
    )"
  fi
fi
[[ -n "$root_storage" ]] ||
  die "no active storage supporting LXC root disks was found; use --storage"

if ! pvesm status -content rootdir |
  awk -v name="$root_storage" \
    'NR > 1 && $1 == name && $3 == "active" {found=1} END {exit !found}'; then
  die "storage $root_storage is not active or does not support LXC root disks"
fi
if ! pvesm status -content vztmpl |
  awk -v name="$template_storage" \
    'NR > 1 && $1 == name && $3 == "active" {found=1} END {exit !found}'; then
  die "template storage $template_storage is not active or does not support templates"
fi

host_arch="$(dpkg --print-architecture)"
case "$host_arch" in
  amd64) template_arch="amd64" ;;
  arm64) template_arch="arm64" ;;
  *) die "unsupported Proxmox host architecture: $host_arch" ;;
esac

echo "[1/5] Selecting a Debian LXC template..."
pveam update
template="$(
  pveam available --section system |
    awk -v arch="$template_arch" \
      '$2 ~ ("^debian-(12|13)-standard_.*_" arch "\\.tar\\.(zst|gz)$") {print $2}' |
    sort -V |
    tail -n 1
)"
[[ -n "$template" ]] ||
  die "no Debian 12/13 ${template_arch} LXC template is available"

template_volume="${template_storage}:vztmpl/${template}"
if ! pveam list "$template_storage" | awk '{print $1}' |
  grep -Fqx "$template_volume"; then
  echo "[2/5] Downloading ${template}..."
  pveam download "$template_storage" "$template"
else
  echo "[2/5] Reusing ${template}..."
fi

net0="name=eth0,bridge=${bridge},ip=${ip_config},firewall=1"
if [[ "$ip_config" != "dhcp" && -n "$gateway" ]]; then
  net0="${net0},gw=${gateway}"
fi

echo "[3/5] Creating unprivileged 5tratumOS CT ${vmid}..."
pct create "$vmid" "$template_volume" \
  --hostname "$guest_hostname" \
  --unprivileged 1 \
  --features nesting=1,keyctl=1,fuse=1 \
  --ostype debian \
  --cores "$cores" \
  --memory "$memory_mb" \
  --swap "$swap_mb" \
  --rootfs "${root_storage}:${disk_gb}" \
  --net0 "$net0" \
  --onboot 1 \
  --start 1 \
  --tags "5tratumos"

guest_ready=0
for _ in $(seq 1 60); do
  if pct exec "$vmid" -- test -e /etc/debian_version 2>/dev/null; then
    guest_ready=1
    break
  fi
  sleep 2
done
(( guest_ready == 1 )) ||
  die "CT $vmid did not become ready; inspect it with: pct console $vmid"

echo "[4/5] Preparing the Debian guest..."
pct exec "$vmid" -- bash -lc \
  "apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ca-certificates curl"

installer_url="https://raw.githubusercontent.com/${INSTALL_REPOSITORY}/${install_ref}/scripts/install-linux.sh"
echo "[5/5] Installing 5tratumOS inside CT ${vmid}..."
pct exec "$vmid" -- env \
  "CHANNEL=${channel}" \
  "INSTALL_TAG=${install_tag}" \
  "INSTALLER_URL=${installer_url}" \
  bash -lc \
  'set -Eeuo pipefail
   installer="$(mktemp)"
   trap '"'"'rm -f "$installer"'"'"' EXIT
   curl -fsSL --retry 3 --retry-delay 2 "$INSTALLER_URL" -o "$installer"
   bash "$installer"'

guest_ip="$(
  pct exec "$vmid" -- hostname -I 2>/dev/null |
    awk '{print $1}'
)"

cat <<EOF

5tratumOS is installed in unprivileged CT ${vmid}.
Guest:    ${guest_hostname}
Address:  ${guest_ip:-check the DHCP lease or run: pct exec ${vmid} -- hostname -I}
Dashboard: http://${guest_ip:-GUEST_IP}/

Proxmox remains the host operating system. The Debian guest supplies the Linux
kernel userspace, and 5tratumOS runs above it as the dashboard, app-store,
update and container-management layer.
EOF
