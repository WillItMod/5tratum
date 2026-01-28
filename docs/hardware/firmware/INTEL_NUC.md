# Intel NUC

Intel NUC firmware is generally straightforward, but Secure Boot and boot priority can block installs.

## Keys (common)

- **BIOS Setup:** `F2`
- **Boot Menu:** `F10`

## Recommended settings for 5tratumOS

### Boot mode (UEFI)

Typical path:
- `Boot` -> `Boot Priority`
  - Ensure **UEFI boot** is enabled and the USB is selectable as `UEFI: ...`

### Secure Boot

Typical path:
- `Boot` -> `Secure Boot`
  - **Secure Boot:** disabled

### Storage / NVMe visibility

If NVMe is missing in the installer, look for:
- `Advanced` -> `Storage` -> **VMD** (disable if present)

### Fast Boot

Typical path:
- `Boot`
  - **Fast Boot:** disabled

