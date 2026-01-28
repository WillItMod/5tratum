# Protectli / Qotom / HUNSN (firewall mini PCs)

These mini PCs are often sold as “router/firewall appliances” and commonly use AMI/Aptio UEFI.

## Keys (common)

- **BIOS Setup:** `Del` or `F2`
- **Boot Menu:** `F7` or `F11` (varies)

## Recommended settings for 5tratumOS

### Secure Boot

Typical path:
- `Security` -> `Secure Boot`
  - disable Secure Boot (or set **OS Type** to **Other OS**)

### Boot mode (UEFI)

Typical path:
- `Boot` -> `CSM`
  - prefer **CSM disabled** (UEFI-only)

### Storage (AHCI / NVMe)

Typical path:
- `Advanced` -> `SATA Configuration`
  - **SATA Mode:** **AHCI**

If the installer can’t see NVMe, check for:
- `Advanced` -> `Intel VMD` (disable if present)

### Fast Boot

Typical path:
- `Boot`
  - **Fast Boot:** disabled

