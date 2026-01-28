# ASUS PN / mini PCs

ASUS firmware often uses “OS Type” as the key toggle for Secure Boot behavior.

## Keys (common)

- **BIOS Setup:** `F2` or `Del`
- **Boot Menu:** `F8`

## Recommended settings for 5tratumOS

### Secure Boot

Typical path:
- `Boot` -> `Secure Boot`
  - **OS Type:** **Other OS**
  - or disable Secure Boot if the toggle is available

### Boot mode (UEFI)

Typical path:
- `Boot` -> `CSM`
  - **Launch CSM:** disabled (UEFI-only)

### Storage (AHCI / VMD)

Typical path:
- `Advanced` -> `SATA Configuration`
  - **SATA Mode Selection:** **AHCI**

### Fast Boot

Typical path:
- `Boot`
  - **Fast Boot:** disabled

