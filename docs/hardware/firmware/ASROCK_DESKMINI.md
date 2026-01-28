# ASRock DeskMini

DeskMini systems tend to be flexible but can default to Secure Boot or CSM depending on BIOS settings.

## Keys (common)

- **BIOS Setup:** `F2` or `Del`
- **Boot Menu:** `F11`

## Recommended settings for 5tratumOS

### Secure Boot

Typical path:
- `Security` -> `Secure Boot`
  - disable Secure Boot (or set to “Other OS” if present)

### Boot mode (UEFI)

Typical path:
- `Boot` -> `CSM`
  - **CSM:** disabled (UEFI-only)

### Storage (AHCI)

Typical path:
- `Advanced` -> `Storage Configuration`
  - **SATA Mode:** **AHCI**

### Fast Boot

Typical path:
- `Boot`
  - **Fast Boot:** disabled

