# Changelog

## v0.8.4 MAIN and v0.8.4-dev (2026-09-08)

- Include every OS/Orbit fix from 0.8.3 and retain the signed 5tratMux 0.9.48-or-newer handoff.
- Automatically update existing Mux Flight downloads after active flights close; check again on launch and reload cached scripts when the installed version changes.
- Preserve optional opt-in, removal, signed licence checks, failed-download fallback and retry.
- Supply signed Local AI catalogue/runtime metadata through an add-on path accepted by the existing 0.8.3 installer; verify it before constructing the host service.
- Allow model selection before runtime installation, with CPU and memory reasons instead of a setup dead end.
- Offer an optional public AMD64 runtime pinned by registry digest, with Qwen model downloads pinned by upstream revision, byte size and SHA-256. Local AI remains experimental and paid-only.
- Preserve existing Local AI runtime and configuration, retain the 8 GiB default for older configurations, and leave ARM OS updates and global OS signature policy unchanged.

Source: `WillItMod/5tratum_Build` commit `bf862769db62dc542f43696901a84dd2c3d63fac`.
MAIN OS archive SHA-256: `321103b4058b6be4bdcb09327a3c4700c98f7980b56818bf90d1bb2d9eec2bd0`.
DEV OS archive SHA-256: `b4c151bf55f46ef6e3ac7b2e08167e43ca4f252e5e13a86fe7311fb3d89b5737`.
MUXFLIGHT 0.1.1 uses the unchanged public archive from v0.8.3: `4b8fcd907ab46f3abff8ab651f679a90233d47113fa7ff5695e7d9fe7c9d161c`.

## v0.8.3 MAIN and v0.8.3-dev (2026-09-08)

- Include every OS/Orbit change from0.8.2 and require the signed5tratMux0.9.48-or-newer app update before OS completion.
- Deliver compatible Mux Flight allocation/formation APIs and the Local5TRATMUX provider dropdown through the coordinated MUX app release.
- Add Mux Flight0.1.1: Theatre weapons, impacts and engine audio follow the active camera and subject rather than the original captain.
- Offer **Update download** for installed optional flight packages, retaining licence checks and closing flight before installation.
- Keep fresh Local AI runtime/model downloads explicitly unavailable until their separate trusted distribution is ready; existing configured runtimes remain separately managed.

Source: `WillItMod/5tratum_Build` commit `06d3372ad96176502b254ea672a788e983feed6b`.
MAIN OS archive SHA-256: `449cfd1d0ab25cf776dfd350fa7c6852745a199ae08625d79ad56b2c5fc4656b`.
DEV OS archive SHA-256: `f765ed2ae182af3f1fee998a25ac6b4a62d6809a0cee411ad6047a331c922126`.
MUXFLIGHT archive SHA-256: `4b8fcd907ab46f3abff8ab651f679a90233d47113fa7ff5695e7d9fe7c9d161c`.

## v0.8.2 MAIN and v0.8.2-dev (2026-09-08)

- Add optional MUXFLIGHT 0.1.0 for users with an active 5tratMux licence, as a separate 152,224,152-byte (145.17 MiB) download. Rendering runs in the viewing browser, with selectable graphics quality.
- Provide Spectate, Manual, Assisted and guided Autopilot, distinct craft and cockpit views, formations, and orbit, deep-space and surface travel with ice canyon runs.
- Show per-miner planned allocations separately from current hash flow; compatible 5tratMux installations accept the captain's mining split under an owned control session.
- Preserve captain mode, formation and accepted allocation when entering and leaving Theatre. Cinematic camera and firing activity do not change mining intent.
- Include 27 classical recordings, local music and direct internet-radio playback. Add explicit recovery for browser-interrupted effects, nearby spacecraft audio and refined weapon intensity.
- Refine fragment clearance and draw distances, terrain and camera continuity, craft separation, target interaction and cockpit presentation.
- Improve Orbit right-click copying, app windows opening in new tabs, resource reporting and fleet views.
- Integrate Local AI settings; fresh Local AI runtime and model downloads are not published in this OS release.
- Publish the same runtime payload to DEV as v0.8.2-dev. 5tratMux remains independently versioned; miner control requires a compatible installation.
- Active signed 5tratMux trials also permit MUXFLIGHT access until trial expiry; Local AI remains paid-only.

Source: `WillItMod/5tratum_Build` commit `a50c398ff8470723d6022ce17156fda57c83acdd`.
MAIN OS archive SHA-256: `b0088de0ccc3fa846a9a37e077dbb180eeb0d8fea714d08dd1368f68c77a9fef`.
MUXFLIGHT archive SHA-256: `f08c4fa9590243417bef211fae5732ce5e3b7b3705c03df4807b16e02c89c544`.

## v0.8.1 and v0.8.1-dev (2026-09-06)

- Introduce Orbit alongside Classic, with an upgrade welcome and persistent interface choice.
- Add independent application windows, resize grips, halves/quarters/fullscreen snapping, and a bottom or left app bar.
- Preserve application management menus and shared settings/update controls; add desktop and app touch-and-hold menus.
- Add configurable fleet/system widgets, grid arrangement, transparency, all-drive storage, and Scrypt-aware MUX routing.
- Represent physical miners once using authoritative MUX IDs, with separate fresh, standby and stale states.
- Introduce the optional animated 5TRATUSPHERE world with varied spacecraft, throughput scaling, node labels and confirmed MUX collector events.
- Keep Dark, bottom app bar and static wallpaper as defaults, with optional live background, custom colours and Donut logo.
- Retain app/OS progress and update prompts in the chosen interface, including verified completion and app-window refresh.
- Repair app proxies before explicit-version update/rollback restarts and fix Ed25519/OpenSSL 3.0 signing/verifier compatibility.
- Keep MUX licensing and updates independent, with forced MUX recovery disabled in these OS bundles.

## v0.6.1 (2026-07-27)

- Repair the normal WebUI update path so the signed 5tratMux runtime is
  installed and started on clean public systems.
- Replace the blank connection-refused pane with a branded loading, repair,
  and retry surface.
- Correct the Mux bootstrap systemd condition and retry failed initial
  installs without user intervention.
- Add a persistent API-health watchdog in addition to Docker's container
  restart policy.
- Restart an unhealthy Mux service automatically and use a rate-limited signed
  reinstall only when a restart cannot restore health.
- Preserve Mux settings, licence state, trial state, and application data
  throughout bootstrap and repair.

## v0.6.0 (2026-07-27)

- Add 5tratMux as a native 5tratumOS control surface beneath Fleet Dashboard.
- Bootstrap the independently signed 5tratMux updater without starting a trial.
- Support production 5tratMux runtimes for both AMD64 and ARM64 systems.
- Reconcile proxy-routed miners by physical identity so Fleet Dashboard reports
  one current row per miner instead of stale per-pool duplicates.
- Prefer current Mux telemetry for route, worker, hardware, and hashrate state
  while preserving direct-pool operation for users who do not run 5tratMux.
- Add Mux-aware app control, route health, and full hardware telemetry,
  including normalized temperature, fan, power, frequency, efficiency, pool,
  and freshness fields.
- Keep 5tratMux updates independent from OS updates while rolling the matching
  updater and bootstrap service into the OS release.
- Repair app proxy routes immediately after an OS update.

## v0.5.9 and v0.5.9-dev (2026-07-24)

- Fix app windows being routed to a node JSON-RPC port while the real web UI is
  still starting after an install or update.
- Treat the UI port declared by an app store manifest as authoritative.
- Reject the Bitcoin-derived `JSONRPC server handles only POST requests`
  response during web UI detection.
- Repair affected 5tratSmack routes back to port `21226`; its node RPC remains
  isolated on `57576`.
- Release the same routing correction to both MAIN and DEV.

Legend:
- `*-dev` = DEV-only pre-release
- MAIN = non-pre-release and/or `releases/latest`

This file captures the shipped release notes for `v0.3.134` through `v0.3.184`.

- `v0.3.134` (2026-01-24): Notifications: status "not-created" -> "not running"; Fleet pool list stays stable if installed-app listing briefly drops entries.
- `v0.3.135-dev` (2026-01-24): DEV-only: remove pin buttons; logo toggle + right-click menu; theme selection persists across refresh; fix mojibake/encoding artifacts.
- `v0.3.136-dev` (2026-01-25): DEV-only: WebUI hardening; proxy self-heal; Fleet polling stability + higher granularity history.
- `v0.3.137-dev` (2026-01-25): DEV-only: updater safety: refuse channel-mismatched bundles unless overridden.
- `v0.3.138-dev` (2026-01-25): DEV-only: Discord/MQTT dip alerts gated (defaults: 5 points / 5 minutes).
- `v0.3.139-dev` (2026-01-25): DEV-only: disk reporting selects correct mount (supports configured default mount); exposes `metrics.primary_disk_path`.
- `v0.3.142-dev` (2026-01-25): DEV-only: mitigate AxeBSV slowness for Fleet/Mining Overview (prefer widget endpoint + tighter timeouts; avoid cold store scans).
- `v0.3.143-dev` (2026-01-25): DEV-only: daemon background-samples dashboard data; widget + fleet endpoints serve cached samples instantly.
- `v0.3.144-dev` (2026-01-25): DEV-only: fix App Store thumbnails/icons on legacy installs (`/store/*` assets mount).
- `v0.3.145-dev` (2026-01-25): DEV-only: Disk UX: combined usage + `<1%` + per-mount bars.
- `v0.3.146-dev` (2026-01-25): DEV-only: Sidebar UX: collapsed nav icons fill/center; preserves installed-app drawer scroll on collapse/expand.
- `v0.3.147-dev` (2026-01-25): DEV-only: Sidebar auto-hide hover scroll anchoring (no jump).
- `v0.3.148-dev` (2026-01-25): DEV-only: Sidebar auto-hide context menu holds drawer open.
- `v0.3.149-dev` (2026-01-25): DEV-only: Sidebar stable row height/spacing; top bar DISK cycles mounts every 5s with `DISK: <name>` + used/total + available.
- `v0.3.150-dev` (2026-01-25): DEV-only: sidebar sizing tweak (collapsed wider, expanded slightly slimmer).
- `v0.3.151-dev` (2026-01-25): DEV-only: sidebar nav continuity (same icon sizing/placement collapsed vs expanded); slightly slower transition.
- `v0.3.152-dev` (2026-01-25): DEV-only: Mining Overview widgets avoid false "not running" (handles legacy/bare Compose project names).
- `v0.3.153-dev` (2026-01-25): DEV-only: widgets resilient to Compose status drift; if widget endpoints respond on localhost, treat app as running.
- `v0.3.154-dev` (2026-01-25): DEV-only: ignore exited init helper services in status (prevents false degraded + restart loops).
- `v0.3.155-dev` (2026-01-25): DEV-only: sidebar nav icons larger/centered in collapsed mode (expanded keeps same sizing for continuity).
- `v0.3.156-dev` (2026-01-25): DEV-only: theme + sidebar mode (auto-hide) persist server-side via `/api/v0/system/ui`.
- `v0.3.157-dev` (2026-01-25): DEV-only: harden Fleet + Mining Overview polling; persistent caches + backoff to reduce flapping with slow apps.
- `v0.3.158-dev` (2026-01-26): DEV-only: fix inflated network throughput display (use default-route interface bytes; add `network.iface` + `network.mode`).
- `v0.3.158` (2026-01-26): MAIN: promotes the above; includes dashboard reliability improvements + sidebar/theme persistence + network metric fix.
- `v0.3.159-dev` (2026-01-26): DEV-only: Fleet worker + hashrate metric fixes (AxeDGB best share mapping; prefer 1-minute hashrates; pool sampling enriched via `/api/pool`).
- `v0.3.160-dev` (2026-01-26): DEV-only: overlay redeploy cleanup (remove-orphans); portal header hardening (server_tokens off + portal-only CSP); App Store modal screenshots contain; Legal modal blockchain disclaimer; keyboard layout API persists to `/etc/default/keyboard`; dark scrollbars.
- `v0.3.161-dev` (2026-01-26): DEV-only: restore CPU temperature in topbar CPU card (`metrics.cpu.temp_c`).
- `v0.3.162-dev` (2026-01-26): DEV-only: Fleet server-backed hashrate history hydrates for new browsers/devices (`/api/v0/fleet/history`).
- `v0.3.163-dev` (2026-01-26): DEV-only: proxy shim for apps that assume they run at `/` when mounted under `/apps/<id>/`.
- `v0.3.164-dev` (2026-01-26): DEV-only: uninstall progress bar no longer pulses on refresh/re-render; includes v0.3.163-dev proxy shim.
- `v0.3.165-dev` (2026-01-26): DEV-only: donut rain renders as proper donuts + sprinkles; runs once every 5 minutes (rate-limited per browser).
- `v0.3.165` (2026-01-26): MAIN: promotes the above; includes /apps/<id>/ proxy shim + uninstall progress stabilization.
- `v0.3.166-dev` (2026-01-26): DEV-only: keep system metrics responsive for slow/bare-metal installs (CPU temp sampled in background); WebUI caches last-good metrics with longer timeout.
- `v0.3.166` (2026-01-26): MAIN: promotes the above.
- `v0.3.167-dev` (2026-01-27): DEV-only: system hostname save + mDNS toggle.
- `v0.3.168-dev` (2026-01-27): DEV-only: Wi‑Fi toggle label fix + show DEV channel.
- `v0.3.169-dev` (2026-01-27): DEV-only: remove Umbrel wording in custom store hint.
- `v0.3.170-dev` (2026-01-27): DEV-only: Store sync made atomic + cache TTL tweaks.
- `v0.3.171-dev` (2026-01-27): DEV-only: app uninstall more idempotent + longer uninstall timeout.
- `v0.3.172-dev` (2026-01-27): DEV-only: Wi‑Fi enable/scan reliability (rfkill unblock, bring link up before scan).
- `v0.3.173-dev` (2026-01-27): DEV-only: auth sessions persist across daemon restart.
- `v0.3.174-dev` (2026-01-27): DEV-only: Legal modal word wrapping fix.
- `v0.3.175-dev` (2026-01-27): DEV-only: Wi‑Fi scan compatibility (no `nmcli --separator`) + longer install timeout.
- `v0.3.176-dev` (2026-01-27): DEV-only: updater cancel + clearer progress UX.
- `v0.3.177-dev` (2026-01-27): DEV-only: global store assets localization + proxy routing fixes.
- `v0.3.178-dev` (2026-01-27): DEV-only: uninstall `--purge` removes migrated app data; repair reports recovered state instead of hard-failing.
- `v0.3.179-dev` (2026-01-27): DEV-only: Apps page launcher becomes a single scrollable list + scrollbar polish.
- `v0.3.180-dev` (2026-01-27): DEV-only: per-app network bandwidth breakdown.
- `v0.3.181-dev` (2026-01-27): DEV-only: per-app storage usage + fleet network difficulty.
- `v0.3.182-dev` (2026-01-27): DEV-only: hotfix daemon startup (fix IndentationError).
- `v0.3.183-dev` (2026-01-27): DEV-only: add node app bandwidth limits.
- `v0.3.184-dev` (2026-01-27): DEV-only: mobile/topbar UX polish.
- `v0.3.184` (2026-01-27): MAIN: promotes the above (update bundle promoted from `v0.3.184-dev`).

Notes:
- Some intermediate build tags may exist without published GitHub releases; this list reflects published releases.
- For newer releases, see the GitHub releases page.
