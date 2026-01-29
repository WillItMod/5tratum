# Firmware (BIOS/UEFI) settings for install & boot

If these settings are not configured correctly, **5tratumOS may not boot**, the installer may **fail to start**, or the installer may **not detect your SSD/NVMe**.

BIOS/UEFI menus vary by vendor and firmware version, so look for **similar wording** if the exact option name differs.

If you’re stuck in one of the common situations (installer won’t boot, fails after reboot, issues when disabling kiosk mode), also see:
- `docs/install/TROUBLESHOOTING.md`

## Quick checklist (recommended)

- **Boot mode:** UEFI (not Legacy/CSM)
- **Secure Boot:** Disabled (or set to "Other OS")
- **Fast Boot:** Disabled
- **USB boot:** Enabled
- **Boot order:** USB first (for install), then internal disk (after install)
- **Storage mode:** AHCI (not RAID/Intel RST)
- **Intel VMD / Intel RST VMD:** Disabled (common reason NVMe is "missing" in installers)

## UEFI vs Legacy (CSM)

**Use UEFI** unless you have a specific reason not to.

- If you boot the installer USB in **UEFI** mode, the installed system will expect to boot in **UEFI** mode.
- If you later switch the machine to **Legacy/CSM**, you may see "No boot device", "No bootable device", or it may boot to a blank screen.

If the USB shows twice in the boot menu (example):
- `UEFI: <USB name>` (choose this)
- `<USB name>` (Legacy/CSM)

Pick the **UEFI** entry.

## Secure Boot

Secure Boot frequently blocks community images and custom kernels/bootloaders.

Typical symptoms:
- "Security Violation"
- "Selected boot image did not authenticate"
- The USB never appears as bootable

Fix:
- Set **Secure Boot = Disabled**
- If your firmware offers a mode, set it to **Other OS** (vendor wording varies)

Some vendors require you to set an **admin/supervisor password** before Secure Boot options become editable. If you set one, store it safely.

## Storage / NVMe detection (AHCI, RAID, VMD)

If the installer boots but the **target disk list is empty** (or only shows USB devices), check these:

- **SATA Operation / Storage Mode:** set to **AHCI**
- **Intel RST / RAID:** disable
- **Intel VMD (Volume Management Device):** disable (common on Dell/Lenovo/Intel)

Notes:
- Disabling VMD can change the disk name/ordering in firmware.
- If the machine won’t boot an existing Windows install after changing these settings, you’ll need to revert settings or reinstall Windows. (5tratumOS install is designed for dedicated hardware.)

## USB boot troubleshooting

If the USB won’t boot:
- Try a different USB port (some systems prefer rear ports; some prefer USB2 for installers).
- Re-flash the USB (Etcher recommended) and verify the checksum.
- Disable **Fast Boot**.
- Make sure the firmware boot menu is being used (HP `F9`, Dell `F12`, Lenovo `F12` are common).

## After install: first reboot

When the installer finishes:
- Remove the USB stick / detach the ISO.
- Ensure the internal disk is first in boot order.
- Keep **UEFI enabled** (match what you used during install).

## Virtual machines (Proxmox/VMware/VirtualBox)

Recommended defaults:
- Firmware: **UEFI** (OVMF on Proxmox)
- Secure Boot: **off**
- Disk: VirtIO/SCSI is fine; just ensure the installer can see it

## Model-specific guides

If you want screenshots/menu paths for common mini PCs (including Beelink), see:

- Hardware index: [docs/hardware/README.md](../hardware/README.md)
- Firmware guides by model: [docs/hardware/firmware/README.md](../hardware/firmware/README.md)

## Extra stability settings (optional)

Not required, but often helps on quirky hardware:

- Update BIOS/UEFI to the latest stable version.
- Load "Optimized Defaults" / "Setup Defaults", then apply the checklist above.
- Disable CPU/memory overclocks (XMP/EXPO/PBO) until the system is stable.

