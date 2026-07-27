# Changelog

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
