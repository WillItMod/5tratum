# Release Process (Update Bundles)

This repo (`WillItMod/5tratum_Build`) produces update bundles consumed by devices via GitHub Releases in `WillItMod/5tratum`.

## 1) Versioning / channels

Tag naming must match the intended update channel:

- MAIN channel: `vX.Y.Z` (no `-dev`)
  - GitHub Release: **not** marked prerelease
  - Bundle metadata: `build.json.channel = "main"`
- DEV channel: `vX.Y.Z-dev`
  - GitHub Release: marked prerelease
  - Bundle metadata: `build.json.channel = "dev"`

Updater guardrails:
- MAIN ignores prereleases and any tag containing `-dev`.
- DEV selects prereleases (and treats `-dev` tags as DEV-only even if a release was published incorrectly).

## 2) Build the update bundle

Linux/macOS:

```bash
# MAIN
TRATUMOS_TAG="v0.x.y" TRATUMOS_CHANNEL="main" ./scripts/build-update-bundle.sh

# DEV
TRATUMOS_TAG="v0.x.y-dev" TRATUMOS_CHANNEL="dev" ./scripts/build-update-bundle.sh
```

Signed (recommended; produces `dist/5tratumos-update.tgz.sig`):

```bash
SIGNING_KEY=/path/to/5tratumos_update_signing.key \
  TRATUMOS_TAG="v0.x.y" TRATUMOS_CHANNEL="main" \
  ./scripts/build-update-bundle.sh
```

Windows PowerShell (equivalent):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\build-update-bundle.ps1 -BuildTag v0.x.y -Channel main -UpdateRepo WillItMod/5tratum
```

Artifacts:
- `dist/5tratumos-update.tgz`
- `dist/5tratumos-update.tgz.sha256`
- `dist/5tratumos-update.tgz.sig` (if signing)

## 3) Publish to GitHub Releases

Create a release in `WillItMod/5tratum` with the matching tag and upload the artifacts above as release assets.

CLI example (recommended for repeatability):

```bash
# MAIN
gh release create v0.x.y dist/5tratumos-update.tgz dist/5tratumos-update.tgz.sha256 --repo WillItMod/5tratum --title "v0.x.y" --notes "MAIN update bundle"

# DEV
gh release create v0.x.y-dev dist/5tratumos-update.tgz dist/5tratumos-update.tgz.sha256 --prerelease --repo WillItMod/5tratum --title "v0.x.y-dev" --notes "DEV update bundle"
```

Promotion flow (DEV -> MAIN):
- Once a DEV tag is validated, rebuild the bundle with `TRATUMOS_CHANNEL=main` and publish a **non-prerelease** tag without `-dev` (e.g. promote `v0.3.184-dev` -> `v0.3.184`).

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
