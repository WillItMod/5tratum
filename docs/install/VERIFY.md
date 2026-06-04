# Verify downloads

Each release asset should have a matching `.sha256` file. Download the asset and its `.sha256` sidecar from the same release, then compare the calculated hash with the value in the sidecar.

Examples:
- `5tratumos-installer-v0.5.00-uefi.iso` + `5tratumos-installer-v0.5.00-uefi.iso.sha256`
- `5tratumos-installer-v0.5.00-bios.iso` + `5tratumos-installer-v0.5.00-bios.iso.sha256`
- `5tratumos-raspios-lite-v0.5.00.img.xz` + `5tratumos-raspios-lite-v0.5.00.img.xz.sha256`

## Windows

```powershell
certutil -hashfile .\5tratumos-installer-v0.5.00-uefi.iso SHA256
```

Compare the output to the matching `.sha256` file.

## Linux / macOS

```sh
sha256sum -c 5tratumos-installer-v0.5.00-uefi.iso.sha256
sha256sum -c 5tratumos-raspios-lite-v0.5.00.img.xz.sha256
```

If your system does not have `sha256sum` on macOS, use:

```sh
shasum -a 256 5tratumos-installer-v0.5.00-uefi.iso
```

Compare the output to the matching `.sha256` file.
