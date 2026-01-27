# Release / Versioning / Channel guardrails

Priority: P0

## Problem
- DEV builds must not be visible to MAIN users by default.
- MAIN vs DEV update selection can depend heavily on GitHub prerelease flags and/or publishing hygiene.
- Users repeatedly report "I don't see the update" (version bumps + correct asset publishing/channel selection).

## Scope
- Updater logic (release selection + apply guardrails).
- Build metadata (`build.json.channel`) consistency.
- Release process documentation / checklist.

## Acceptance criteria
- MAIN channel **never** selects tags containing `-dev` (even if GitHub prerelease flag is wrong).
- DEV channel selects prereleases, and also treats `-dev` tags as DEV-only.
- Update apply refuses channel mismatches by default:
  - requested channel must match installed channel (from `/etc/5tratumos/channel`) unless user explicitly overrides.
  - requested channel must match `build.json.channel` of the installed system unless override.
- Release checklist includes:
  - correct tag naming
  - correct GitHub prerelease flag
  - artifacts uploaded (`.tgz`, `.sha256`, optional `.sig`)
  - version bump validated via a device check.

## Notes
- A pragmatic implementation is to treat `-dev` in tag as authoritative DEV marker.
- Consider adding an "override" toggle in `Settings -> Updates` (stored in `/etc/5tratumos/update.json`).

## Status
- Implemented in `daemon/5tratumosd.py:_select_release()` (MAIN ignores prereleases/`-dev`; DEV prefers prereleases and treats `-dev` as DEV-only).
- Release checklist documented in `docs/RELEASE_PROCESS.md`.
