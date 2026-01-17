# Outstanding Issues / Backlog

Last updated: 2026-01-17

## P0 - Reliability / Breakages
- App updates from Portal: ensure end-to-end correctness (no "App action failed" when update actually succeeds; installed version/state updates immediately; clear updating -> restarting -> running).
- Proxy robustness: prevent /apps/<id>/ breakage across updates (wrong port, wrong app id, URL encoding/%5C/trailing-slash edge cases); add/verify Settings -> Advanced -> Fix Proxy works for all installed apps.
- Current broken apps via proxy: investigate/fix AxeBTCF, AxeBench (port works but proxy fails), Tailscale not loading through proxy, AxeDGB not loading (and its API 503s).
- "App in unknown state" handling: prevent stuck "restarting..." overlays and misleading statuses (not-created, etc.).

## P1 - Navigation / Layout
- Sidebar: clock still not pinned to bottom (collapsed + expanded); redesign so bottom area is fixed and apps list scrolls independently.
- Sidebar: collapsed app icons must stay full size (not squashed); add pin/unpin behavior (pin = keep in drawer; unpinned disappears when stopped but running apps always show).
- Pages: Fleet, Desktop, Workbench order + make Fleet default on load; Workbench currently opening wrong screen sometimes.
- Add a dedicated Apps page (alphabetical grid/list of installed apps) and remove "Global App Store" from the sidebar; add an App Store CTA/button inside the Apps page header.
- Top banner/card: keep visible on Apps page (it "goes missing" in some views).

## P1 - Desktop (Launchers + Folders)
- Desktop grid is broken: icons "creep", don't snap cleanly, don't reposition reliably, and drop-on-icon doesn't create folders.
- Desktop persistence: icons sometimes don't render until refresh; thumbnails revert to fallback letters after refresh.
- Desktop should fill available height (currently stops halfway down in some layouts).
- Folder UX: create/open folders, move apps in/out, persist layout.

## P2 - Visual Polish / Assets
- Logos: sidebar + topbar logo sizing/position keeps regressing (off-screen/cropped/too small/too big); stabilize with new cropped assets (5cropped, updated wordmark).
- "Rebooting / restarting" splash: full-screen "don't refresh" screen with spinner + large/wordmark logo.
- Modals: replace any "Windows-style popups" with consistent Tailwind modals.

## P2 - App Store / Sync
- Background sync: App Store sync every 15 minutes by default; settings toggle to disable; manual Sync button remains.
- Update UX: progress should reach 100%, then clearly show "installing/restarting", then flip UI to the new installed version without requiring page refresh; fix duplicated "Updating XX%" buttons.

## P3 - Platform / Settings / Features Backlog
- Session auto-lock timeout setting (minutes; 0 = never).
- Disable host sleep/suspend behavior (system-level).
- Data management: move app/container data between drives; detect missing drive and mark app "offline - drive missing".
- MQTT stats export to Mosquitto (if installed) + per-app settings card.
- Discord notifications for hashrate/blocks + per-app settings card.
- "ReDeploy" / "Repair" actions: redeploy app containers while preserving data; plus optional "Repair Proxy"/"Repair All Proxies".

## P3 - Cleanup
- Remove remaining backend references to forgeos/ForgeOS and remove "Umbrel" wording entirely (use "Global App Store").
- Mobile optimization + HTTPS/cert/PWA-style install experience (later, after stability).

## Recent Context
- App updates were failing because the updater script had bad indentation inside the Python heredoc used to write 5tratumos.json after an update.
- Fix applied in `bin/5tratumos` (metadata block with no leading-space lines for `meta = {` and `print(json.dumps(...))`).
- Pushed to `WillItMod/5tratum_Build` (main) and deployed to `/usr/local/bin/5tratumos` on the VM.
- `sudo 5tratumos app update axebch --channel dev` now succeeds; metadata shows `installed_version: "0.7.142-dev"`.
- UI should no longer show "App action failed" after a successful update.
