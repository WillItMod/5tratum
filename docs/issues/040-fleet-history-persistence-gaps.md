# Fleet stability (drops/flatlines) + persistent history ring buffer

Priority: P0

## Problem
- Fleet hashrate/workers can drop to zero/flatline due to:
  - a single bad app poll
  - overwriting last-good totals with zeros on failed poll
  - sampling tied to UI being open
  - lack of shared history across tabs/devices

## Scope
- Daemon sampling loop independent of UI
- Persistent history (disk-backed ring buffer; SQLite recommended)
- UI rendering of gaps (don’t connect lines over missing samples)
- Merge server history + local cache keyed by host

## Acceptance criteria
- Daemon collects samples on timer independent of UI.
- Persistent ring buffer survives:
  - refresh
  - new tab/device
  - daemon restart
- On failure:
  - store `{ok:false, value:null}` (or equivalent)
  - do not overwrite last-good totals with 0
- UI:
  - renders gaps/grey/dashed segments for missing data
  - does not draw connecting line over gaps

