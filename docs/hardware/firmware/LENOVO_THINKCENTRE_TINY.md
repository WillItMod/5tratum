# Lenovo ThinkCentre Tiny / ThinkStation (and similar)

Lenovo business desktops are common mini PC hosts and often default to Secure Boot + UEFI.

## Keys (common)

- **BIOS Setup:** `F1` (sometimes `Enter` then `F1`)
- **Boot Menu:** `F12`

## Recommended settings for 5tratumOS

### Boot mode (UEFI)

Typical path:
- `Startup` -> `UEFI/Legacy Boot`
  - **UEFI Only**

### Secure Boot

Typical path:
- `Security` -> `Secure Boot`
  - **Secure Boot:** disabled

### Storage (AHCI / RAID / VMD)

Typical paths:
- `Devices` / `Storage` -> `SATA Controller Mode`
  - **AHCI**

And if present:
- `Devices` / `Storage` -> **Intel VMD**
  - **VMD:** disabled

### Fast Boot

Typical path:
- `Startup` -> `Boot Speed`
  - **Fast Boot:** disabled

