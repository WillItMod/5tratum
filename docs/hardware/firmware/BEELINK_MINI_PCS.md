# Beelink mini PCs (AMI/Aptio firmware)

Most Beelink systems ship with AMI/Aptio UEFI. Menu names vary, but the same core settings apply.

## Keys (common)

- **BIOS Setup:** `Del` or `F2`
- **Boot Menu:** `F7` or `F11` (varies)

## Recommended settings for 5tratumOS

### Boot mode (UEFI)

Typical path:
- `Boot`
  - **CSM:** disabled (UEFI-only)

If you must enable CSM to boot the USB, keep the system consistent: install and boot in the same mode.

### Secure Boot

Typical path:
- `Security` -> `Secure Boot`
  - **Secure Boot:** disabled
  - or set **OS Type** to **Other OS**

### Storage (AHCI / VMD)

Typical path:
- `Advanced` -> `SATA Configuration`
  - **SATA Mode:** **AHCI**

Some models expose VMD under:
- `Advanced` -> `Intel(R) VMD` (disable if present)

### Fast Boot

Typical path:
- `Boot`
  - **Fast Boot:** disabled

