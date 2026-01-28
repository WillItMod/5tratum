# MSI Cubi

MSI Cubi systems are common mini PC hosts and typically have clear UEFI/Secure Boot options.

## Keys (common)

- **BIOS Setup:** `Del`
- **Boot Menu:** `F11`

## Recommended settings for 5tratumOS

### Secure Boot

Typical path:
- `Settings` -> `Security` -> `Secure Boot`
  - disable Secure Boot, or set OS type to **Other OS**

### Boot mode (UEFI)

Typical path:
- `Settings` -> `Boot`
  - disable **CSM** if present (UEFI-only)

### Storage (AHCI)

Typical path:
- `Settings` -> `Advanced` -> `Integrated Peripherals` / `SATA Configuration`
  - set to **AHCI**

### Fast Boot

Typical path:
- `Settings` -> `Boot`
  - **Fast Boot:** disabled

