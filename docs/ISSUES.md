# Outstanding Issues / Backlog

Last updated: 2026-01-18

## P0 - Reliability / Breakages
- App updates UX: after update completes, tiles/cards must refresh version/state and remove update badge immediately (also hard-refresh any open Workbench iframe for that app).
- Fleet/widgets continuity: ensure cached data persists across sessions so Fleet doesn't "drop to zero" on cold load.

## P1 - Navigation / Layout
- App Store nav: custom stores should be dynamic (no fixed "Custom1/Custom2"), show store name, and allow removing custom stores.
- Top banner/card: keep visible on Apps page (currently can disappear in some views).

## P1 - Desktop (Launchers + Folders)
- Desktop grid broken: icons creep, don't snap cleanly, don't reposition reliably, and drop-on-icon doesn't create folders.
- Desktop persistence: icons sometimes don't render until refresh; thumbnails revert to fallback letters after refresh.
- Folder UX: create/open folders, move apps in/out, persist layout.

## P2 - Visual Polish / Assets
- "Rebooting / restarting" splash: full-screen "don't refresh" screen with spinner + large/wordmark logo.
- Modals: replace any "Windows-style popups" with consistent Tailwind modals.
- Doom icon 404/flicker: ensure `/assets/doom.webp` is deployed with the portal overlay.
- Top banner wordmark sizing/position stability (avoid cropping/offset regressions).

## P2 - App Store / Sync
- Update settings: GitHub token save should show "saved" state in UI and reflect configured creds (not blank).
- "Add custom store" button: allow entering store URL; store label should be the store name (not a placeholder).
- Custom store removal UX: delete/remove custom stores (not MAIN/DEV/Global).

## P3 - Platform / Settings / Features Backlog
- Disable host sleep/suspend behavior (system-level).
- Data management: move app/container data between drives; detect missing drive and mark app "offline - drive missing".
- MQTT stats export to Mosquitto (if installed) + per-app settings card.
- Discord notifications for hashrate/blocks + per-app settings card.
- "ReDeploy" / "Repair" actions: redeploy app containers while preserving data; plus optional "Repair Proxy"/"Repair All Proxies" (currently flaky).

## P3 - Cleanup
- Remove remaining backend references to forgeos/ForgeOS and remove "Umbrel" wording entirely (use "Global App Store").
- Mobile optimization + HTTPS/cert/PWA-style install experience (later, after stability).

## Current Session Items (needs follow-through)
- Run a smoke test: `docs/SMOKE_TEST.md`.
- Ensure update signing is enabled on devices (`docs/UPDATE_SIGNING.md`).

## Recent Context
- App updates were failing because the updater script had bad indentation inside the Python heredoc used to write 5tratumos.json after an update.
- Fix applied in `bin/5tratumos` (metadata block with no leading-space lines for `meta = {` and `print(json.dumps(...))`).
- Pushed to `WillItMod/5tratum_Build` (main) and deployed to `/usr/local/bin/5tratumos` on the VM.
- `sudo 5tratumos app update axebch --channel dev` now succeeds; metadata shows `installed_version: "0.7.142-dev"`.
- UI should no longer show "App action failed" after a successful update.
