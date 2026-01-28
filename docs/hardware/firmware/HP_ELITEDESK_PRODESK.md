# HP EliteDesk / ProDesk (business desktops)

Menus vary across generations (G1–G6+), but HP systems commonly hide “legacy/secure boot” under the **Security** or **Boot Options** sections.

## Keys (common)

- **Startup Menu:** `Esc`
- **BIOS Setup:** `F10`
- **Boot Device Options:** `F9`

## Recommended settings for 5tratumOS

### Boot mode (UEFI)

Typical path (varies):
- `Advanced` -> `Boot Options`
  - **UEFI Boot Order:** enabled
  - **Legacy Boot Order / Legacy Support:** disabled (unless you must use CSM)

If you see two USB entries in the boot menu, choose the one prefixed with **UEFI**.

### Secure Boot

Typical path:
- `Security` -> `Secure Boot Configuration`
  - **Secure Boot:** disabled

Notes:
- Some models require setting an **admin password** before Secure Boot toggles become editable.

### Storage (AHCI / RAID / VMD)

Typical path:
- `Storage` -> `Storage Options`
  - **SATA Emulation / SATA Device Mode:** **AHCI**

If the installer boots but cannot see your NVMe, look for:
- `Advanced` / `Storage` -> **Intel VMD** (disable if present)

### Fast Boot

Typical path:
- `Advanced` -> `Boot Options`
  - **Fast Boot:** disabled

