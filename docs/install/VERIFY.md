# Verify downloads

Each release includes checksums for install media.

## Windows

```powershell
certutil -hashfile .\\5tratumos-installer.iso SHA256
```

Compare the output to the SHA256 listed in the Release assets.

## Linux / macOS

```sh
sha256sum 5tratumos-installer.iso
```

Compare the output to the SHA256 listed in the Release assets.

