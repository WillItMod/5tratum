# Verify downloads

Each release includes checksums for install media.

## Windows

```powershell
certutil -hashfile .\\5tratumos-installer.iso SHA256
```

Compare the output to the SHA256 listed in the Release assets.

For the direct-flash image (if present in the release):

```powershell
certutil -hashfile .\\5tratumOS_v<version>_Balena.img.xz SHA256
```

## Linux / macOS

```sh
sha256sum 5tratumos-installer.iso
```

Compare the output to the SHA256 listed in the Release assets.

For the direct-flash image (if present in the release):

```sh
sha256sum 5tratumOS_v<version>_Balena.img.xz
```
