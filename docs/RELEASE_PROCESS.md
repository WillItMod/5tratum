# Release Process (v0.3.32+)

This repo produces update bundles consumed by devices via GitHub Releases.

## 1) Versioning
- First public release tag: `v0.3.32`
- Increment tags for each update bundle pushed to the public update repo (`WillItMod/5tratum`).

## 2) Build the update bundle

From this repo:

```bash
./scripts/build-update-bundle.sh
```

Signed (recommended):

```bash
SIGNING_KEY=/path/to/5tratumos_update_signing.key ./scripts/build-update-bundle.sh
```

Artifacts:
- `dist/5tratumos-update.tgz`
- `dist/5tratumos-update.tgz.sha256`
- `dist/5tratumos-update.tgz.sig` (if signing)

## 3) Publish to GitHub Releases

Create a release in `WillItMod/5tratum` with tag `v0.3.32` (or newer) and upload the artifacts above as release assets.

Notes:
- MAIN update channel uses the latest non-prerelease.
- DEV update channel uses the latest prerelease (if enabled later).

## 4) Device prerequisites

On each device:
- Install the update verification public key (recommended): see `docs/UPDATE_SIGNING.md`.
- Ensure the daemon can reach GitHub Releases (and has a token configured if private).

## 5) Validate end-to-end on a device

In the UI:
- `Settings -> Updates -> Check updates` (should show the new tag)
- `Update` (should download, verify signature (if configured), apply, and restart services)

Expected behavior after update:
- UI reflects new version/state without a manual refresh.
- Any open Workbench iframe for an updated app reloads automatically.

## 6) Debian/OS security updates (recommended)

Do not tie major Debian upgrades to the 5tratumOS update bundle.

Recommended approach:
- Enable `unattended-upgrades` for security patches.
- Keep major OS upgrades as a separate, explicit maintenance operation (with reboot window).
