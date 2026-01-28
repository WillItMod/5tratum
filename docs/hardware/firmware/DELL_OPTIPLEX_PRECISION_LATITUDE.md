# Dell OptiPlex / Precision / Latitude (UEFI + Secure Boot)

Dell firmware is usually consistent across OptiPlex Micro/SFF/Tower and many Precision/Latitude models.

## Keys (common)

- **BIOS Setup:** `F2`
- **One-time Boot Menu:** `F12`

## Recommended settings for 5tratumOS

### Boot mode (UEFI)

Typical path:
- `Boot Configuration` / `General` -> `Boot Sequence`
  - **Boot List Option:** **UEFI**

If your system has both “UEFI” and “Legacy” options, avoid Legacy/CSM unless needed.

### Secure Boot

Typical path:
- `Secure Boot` -> `Secure Boot Enable`
  - **Secure Boot:** disabled

### Storage (AHCI / RAID / VMD)

If the installer can’t see your disk, this is the most common Dell fix.

Typical paths:
- `Storage` -> `SATA Operation`
  - set to **AHCI** (not `RAID On`)

And if present:
- `Storage` -> `Intel VMD` / `VMD Controller`
  - **VMD:** disabled

Notes:
- Changing `SATA Operation` can break an existing Windows install. 5tratumOS installs are intended for dedicated disks.

### Fast Boot

Typical path:
- `POST Behavior` -> `Fastboot`
  - set to **Thorough** / **Disabled**

