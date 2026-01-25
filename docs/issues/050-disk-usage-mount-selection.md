# Disk usage incorrect (mount selection + units)

Priority: P1

## Problem
- Disk usage reporting inconsistent:
  - wrong mount selected (e.g. `/` showing TBs unexpectedly)
  - inconsistent units vs `/srv/5tratumos-data`

## Scope
- Daemon/system metrics source of truth
- Mount selection policy (prefer data mount)
- Consistent unit formatting

## Acceptance criteria
- Disk usage consistently reports the intended mount:
  - prefer `/srv/5tratumos-data` if present
  - otherwise fall back to the mount containing the data dir
- UI and API present consistent units and percentages.

