# 5tratumOS Self‑Repair (run on the box)

If a box is partially broken (UI/daemon mismatch, proxy issues, etc.), you can re-apply a known-good release bundle **without needing the normal UI updater**.

This uses a small public GHCR container that:
- downloads the pinned release bundle (`5tratumos-update.tgz`) + `.sha256`
- verifies SHA256
- replaces `/opt/5tratumos/{overlay,daemon,console,...}`
- restarts `5tratumosd` + overlay

## Run

SSH into the target machine, then run:

```bash
sudo docker run --rm --privileged --pid=host --network host -v /:/host \
  ghcr.io/willitmod/5tratumos-self-repair:v0.3.122
```

## Private release support

If the bundle is stored on a **private** GitHub Release, the runner automatically uses:

`/etc/5tratumos/update.token`

## What it changes

It makes timestamped backups under `/opt/5tratumos/*` (e.g. `overlay.bak-<timestamp>`) before replacing directories.
