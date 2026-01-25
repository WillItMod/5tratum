# Top bar + sidebar UI/UX (mobile + TopBar v2 + interactions)

Priority: P1

## Problem
- Mobile top bar must be “mini mini” (current layout unusable).
- Collapsed top bar logo needs centering; donut logo missing on mobile.
- Expanded top bar layout needs redesign (TopBar v2):
  - clean stacking
  - responsive metric grid
  - label “NETWORK” -> “IP”
- Remove pins from collapsed sidebar/topbar/drawer; use logo click + right-click options instead.
- Collapsed sidebar icons must be larger, centered, fill card.

## Scope
- UI layout + responsive breakpoints
- Interaction model (click/hover/context menu)
- Sidebar/topbar state persistence

## Acceptance criteria
- Mobile:
  - top bar is compact and usable in a phone webview
  - logo centered in collapsed/mini state (including donut theme)
- TopBar v2:
  - Row 1: logo/version/badge + tagline aligned
  - Row 2: responsive metric cards (auto-fit minmax)
  - “NETWORK” label becomes “IP”
- Interactions:
  - click logo toggles shrink/expand
  - right-click opens options menu:
    - expanded / shrunk / auto for topbar and sidebar
  - pins removed everywhere requested
- Collapsed sidebar:
  - icons fill their card and are centered
  - remove “APPS” header in expanded drawer
  - button heights consistent between collapsed vs expanded (no jump)

