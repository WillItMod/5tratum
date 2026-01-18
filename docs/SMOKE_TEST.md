# Smoke Test Checklist

Use this checklist to validate a build end-to-end and record any remediation items in `docs/ISSUES.md`.

## Setup
- Device reachable at `http://<ip>/`
- Login works (admin) and session persists across refresh
- At least 2 AxeSuite apps installed (one pool app + one widget app)

## Navigation / Layout
- Sidebar expands/collapses without layout jumps
- Clock stays pinned to bottom (expanded + collapsed)
- Apps list scrolls independently from sidebar footer
- Top banner/card remains visible on all major pages (Fleet, Desktop, Apps, Workbench, Settings)
- Mobile: sidebar becomes off-canvas drawer and is usable on small screens

## Fleet Page
- CPU/MEM/DISK/NETWORK cards populate quickly on cold load
- Fleet Hashrate card shows values and "Updated" timestamp
- Workers table populates; units for Best Share use SI (K/M/G/T)
- Mining Overview widgets load; one slow app does not block all others
- Leaving Fleet and returning later shows cached last-known values before live refresh

## Desktop Page
- Icons render on first load (no “only appears after dragging”)
- Drag feels consistent (mouse + touch)
- Icons snap to grid and stay where dropped
- Folder creation works (drop-on-icon) and persists across refresh
- Desktop fills available height (no half-height clipping)

## Apps Page
- Installed apps list reflects running/stopped accurately
- App Store entrypoint is in the sidebar under Apps (not a header button)
- App Store modal images fit the card and do not reuse the app logo as a screenshot

## Workbench
- Opening an app launches reliably through proxy
- Tailscale app opens the correct URL (no "Page not found")
- After updating an app, any open iframe/window for that app reloads to the new UI (no hard refresh needed)

## Settings
**Updates**
- GitHub token can be saved and shows “Saved” state after refresh
- Update check works for MAIN
- Apply update completes and portal reflects new version/state immediately

**Integrations**
- MQTT: settings save persists across refresh; enabling installs/starts Mosquitto if needed
- Discord: settings save persists across refresh; webhook test succeeds

## Repair / Fix App
- “Fix App” runs against a selected app
- User data (wallets, config) remains intact after repair
- Proxy/ports work after repair
