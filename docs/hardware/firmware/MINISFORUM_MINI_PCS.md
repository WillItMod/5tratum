# Minisforum mini PCs (AMI/Aptio firmware)

Minisforum systems are typically AMI/Aptio UEFI, similar to many Beelink units.

## Keys (common)

- **BIOS Setup:** `Del` or `F2`
- **Boot Menu:** `F7` or `F11` (varies)

## Recommended settings for 5tratumOS

### Secure Boot

Typical path:
- `Security` -> `Secure Boot`
  - disable Secure Boot or set **OS Type** to **Other OS**

### UEFI vs CSM

Typical path:
- `Boot` -> `CSM`
  - prefer **CSM disabled** (UEFI-only)

### Storage (AHCI / VMD)

Typical path:
- `Advanced` -> `SATA Configuration`
  - **SATA Mode:** **AHCI**

If NVMe is missing in installers, check:
- `Advanced` -> `Intel VMD` (disable if present)

### Fast Boot

Typical path:
- `Boot`
  - **Fast Boot:** disabled

