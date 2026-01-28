# Zotac ZBOX

Many ZBOX models use AMI/Aptio-style menus; focus on Secure Boot, UEFI/CSM, and AHCI.

## Keys (common)

- **BIOS Setup:** `Del` or `F2`
- **Boot Menu:** `F11`

## Recommended settings for 5tratumOS

### Secure Boot

Typical path:
- `Security` -> `Secure Boot`
  - disable Secure Boot or set **OS Type** to **Other OS**

### Boot mode (UEFI)

Typical path:
- `Boot`
  - disable **CSM** if present (UEFI-only)

### Storage (AHCI)

Typical path:
- `Advanced` -> `SATA Configuration`
  - **SATA Mode:** **AHCI**

### Fast Boot

Typical path:
- `Boot`
  - **Fast Boot:** disabled

