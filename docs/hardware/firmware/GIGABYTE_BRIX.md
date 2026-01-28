# Gigabyte BRIX

Gigabyte firmware frequently groups Secure Boot and UEFI/CSM options under “BIOS Features”.

## Keys (common)

- **BIOS Setup:** `Del`
- **Boot Menu:** `F12`

## Recommended settings for 5tratumOS

### Secure Boot

Typical path:
- `BIOS Features` -> `Secure Boot`
  - disable Secure Boot, or set the OS/Windows features mode to **Other OS**

### Boot mode (UEFI)

Typical path:
- `BIOS Features`
  - **CSM Support:** disabled (UEFI-only)

### Storage (AHCI)

Typical path:
- `Peripherals` -> `SATA And RST Configuration`
  - **SATA Mode Selection:** **AHCI**

### Fast Boot

Typical path:
- `BIOS Features`
  - **Fast Boot:** disabled

