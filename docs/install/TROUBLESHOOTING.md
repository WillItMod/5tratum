# Install & boot troubleshooting

Most problems fall into one of these categories:

1) **Can’t boot the installer at all**
2) **Installs, but fails after the first reboot**
3) **Works until kiosk mode is disabled**, then the local display becomes unstable (crash/black screen/freeze)

This is a Debian-based install path, so the root causes are usually firmware (BIOS/UEFI) boot settings, storage mode (AHCI/VMD), or graphics initialization.

Start here:
- [FIRMWARE.md](FIRMWARE.md)

## Before you change anything

- If possible, **update BIOS/UEFI** to the newest stable version for your model.
- Take photos/screenshots of your current BIOS/UEFI pages so you can undo changes.
- Start from "Optimized Defaults" / "Setup Defaults", then apply:
  - [FIRMWARE.md](FIRMWARE.md)

## 1) Installer won’t boot (blank screen / reboots / “not bootable”)

Most common causes:
- Secure Boot is still enabled
- The USB is being booted in Legacy/CSM mode instead of UEFI
- Fast Boot is skipping USB initialization
- The USB write is corrupt / wrong target device

Try this, in order:

1) **Disable Secure Boot** (or set OS type to "Other OS").
2) Boot the USB from the one-time boot menu and select the **UEFI** entry:
   - Example: `UEFI: <USB name>` (preferred) vs `<USB name>` (Legacy)
3) **Disable Fast Boot**.
4) Re-flash the USB (Etcher recommended) and verify the download checksum:
   - [VERIFY.md](VERIFY.md)
5) Try a different USB port (rear ports often work best; some systems prefer USB2 for installers).

If your release tag includes a diagnostics ISO, try it to confirm your hardware can boot the media.

## 2) Install finished, but the system fails after reboot

Most common causes:
- The installer USB is still attached and the machine keeps booting it
- Boot order is wrong (internal disk isn’t first)
- Boot mode mismatch (installed in UEFI, then rebooted in Legacy/CSM)
- Storage mode mismatch (AHCI/VMD/RST) so the firmware can’t boot the installed disk
- Fast Boot / firmware power settings causing a broken reboot cycle

Checklist:

1) **Remove the USB** (or detach the ISO) before rebooting.
2) In BIOS/UEFI, set the internal SSD/NVMe as the first boot device.
3) Keep the machine in **UEFI** mode (match how you booted the installer).
4) Ensure storage mode is compatible:
   - **AHCI enabled**
   - **Intel RST / RAID disabled**
   - **Intel VMD disabled** (very common reason NVMe disappears or won’t boot)
5) Disable **Fast Boot**.

If the machine hangs on reboot/shutdown:
- Disable Fast Boot and update BIOS/UEFI first.
- If your firmware has power options like “Deep Sleep”, “ErP”, or aggressive power saving, try disabling them temporarily while testing.

### Boots to a console login prompt (tty1) instead of the kiosk UI

If the install completes but you only see a text login prompt on the local display:

- Try switching virtual terminals:
  - `Ctrl+Alt+F7` (common kiosk/display VT)
  - `Ctrl+Alt+F1` / `Ctrl+Alt+F2` (some systems map these differently)
- If the WebUI works over the network, treat this as a local graphics/display issue and continue with section 3.

## 3) Works until kiosk mode is disabled (local display crashes/black screen)

If the system is stable headless (WebUI/SSH) but becomes unstable when you change kiosk/local-display settings, it’s usually a **graphics initialization/driver** issue.

Practical guidance:

- If the WebUI still works, treat this as a **local display** issue first (not an OS install failure).
- If your system has both iGPU + dGPU, make sure your BIOS/UEFI settings match what you’re using:
  - **Primary Display / Initial Display Output:** choose iGPU (IGFX) or dGPU (PEG/PCIe) explicitly
  - Disable “Hybrid Graphics” / “Switchable Graphics” if it causes instability
  - Ensure the GPU you expect to use is enabled (some systems disable iGPU when dGPU is present)
- Prefer **UEFI-only** boot (CSM off) on modern GPUs.

If the local display remains unstable:
- Re-enable kiosk mode and keep using WebUI/SSH while testing.
- Capture logs and open an issue with your hardware details (model + BIOS version + CPU + GPU).

## Hardware-specific guides

If you want menu paths for common mini PCs (including Beelink), see:
- [hardware firmware guides](../hardware/firmware/README.md)
