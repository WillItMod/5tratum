# Themes (Settings tab + persistence + donut specifics)

Priority: P2

## Problem
- Need a Themes tab in Settings (AxeBench-like), multiple themes (target: ~8).
- Theme selection must persist across refresh reliably.
- Donut theme needs specific assets/opacity behavior; remove earlier “bad donut background” attempt.

## Scope
- UI: Settings -> Themes
- UI config persistence (likely localStorage and/or `/etc/5tratumos/ui.json` via API)
- Assets:
  - donuts watermark image
  - donut topbar logo only in donut mode
  - donut sidebar “5” logo (`5_donut.png`) filling its card properly

## Acceptance criteria
- Themes list displays, and selection is applied immediately.
- Selection persists across:
  - page refresh
  - browser close/open
  - switching views
- Each theme specifies:
  - background palette + subtle gradients
  - font color adjustments
  - watermark opacity (global target: 0.3)
- Donut theme:
  - replaces watermark with `donuts.png` (tuned opacity, stronger image)
  - swaps top bar logo to donut logo only in donut mode
  - swaps sidebar “5” to donut `5_donut.png`, fills card (cropped square), not oversized

