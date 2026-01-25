# Misc UI polish (scrollbars + splash/progress + cancel)

Priority: P2

## Problem
- Scrollbars should be dark theme.
- Workbench scrollbars squashing icons.
- Update splash/progress:
  - disappearing early
  - progress stuck at 94% with no explanation
  - action should appear in top bar if modal dismissed
- Need cancel button with heavy warning.

## Scope
- UI styling for scrollbars
- Update UX state machine in UI
- Status surfacing in top bar

## Acceptance criteria
- Dark themed scrollbars throughout.
- Workbench icons no longer squashed by scrollbars.
- Update modal:
  - persists appropriately
  - exposes meaningful states and tooltips for long tail (e.g. “waiting for clean container exit”)
  - has cancel button with clear warning
- If dismissed, ongoing actions remain visible in top bar.

