# 5tratumOS Self‑Repair (GHCR)

This is a **self-contained repair runner** intended to be executed **on the target 5tratumOS machine** (via SSH).

It downloads a pinned 5tratumOS update bundle from GitHub Releases, verifies its SHA256, applies it to `/opt/5tratumos`, and restarts services.

## Run (on the target machine)

```bash
sudo docker run --rm --privileged --pid=host --network host -v /:/host \
  ghcr.io/willitmod/5tratumos-self-repair:v0.3.122
```

## Private releases

If the update bundle is hosted on a private GitHub release, the runner will automatically use the token in:

`/etc/5tratumos/update.token`

## Safety

- Takes timestamped backups under `/opt/5tratumos/*` before replacing directories.
- Uses a simple lock under `/run/5tratumos-self-repair.lock` to avoid concurrent runs.
