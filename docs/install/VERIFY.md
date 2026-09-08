# Verify downloads

Each release asset should have a matching `.sha256` file. Download the asset and its `.sha256` sidecar from the same release, then compare the calculated hash with the value in the sidecar.

The OS bundles and install media are **unsigned**; their `.sha256` files verify
download integrity. Native 5TRATMUX release/catalogue metadata and the optional
Local AI catalogue use their separately pinned signing trust. Those signatures
do not sign the entire OS bundle or installer image.

Examples:
- `5tratumos-installer-v0.8.7-uefi.iso` + `5tratumos-installer-v0.8.7-uefi.iso.sha256`
- `5tratumos-installer-v0.8.7-bios.iso` + `5tratumos-installer-v0.8.7-bios.iso.sha256`
- `5tratumos-raspios-lite-v0.8.7-arm64.img.xz` + `5tratumos-raspios-lite-v0.8.7-arm64.img.xz.sha256`

## Windows

```powershell
certutil -hashfile .\5tratumos-installer-v0.8.7-uefi.iso SHA256
```

Compare the output to the matching `.sha256` file.

## Linux / macOS

```sh
sha256sum -c 5tratumos-installer-v0.8.7-uefi.iso.sha256
sha256sum -c 5tratumos-raspios-lite-v0.8.7-arm64.img.xz.sha256
```

If your system does not have `sha256sum` on macOS, use:

```sh
shasum -a 256 5tratumos-installer-v0.8.7-uefi.iso
```

Compare the output to the matching `.sha256` file.
