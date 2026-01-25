# ISO / RPi images / token injection / Wi‑Fi installer UX

Priority: P3

## Problem
- ISO/RPi image builds requested frequently.
- Internal testing needs update token embedded (`/etc/5tratumos/update.token`).
- BIOS/UEFI Wi‑Fi flow can dead-end on invalid passphrase; needs back/skip.

## Scope
- ISO build automation
- RPi image build (xz output compatible with Raspberry Pi Imager)
- Token embedding + optional prompt fallback
- Installer Wi‑Fi UX improvements

## Acceptance criteria
- ISO build produces bootable image embedding:
  - update bundle
  - `build.json`
  - optional `update.token`
- RPi image build outputs `.img.xz`.
- Installer Wi‑Fi:
  - validates passphrase
  - allows back/skip without dead end in BIOS and UEFI flows

