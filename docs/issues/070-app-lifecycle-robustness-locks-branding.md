# App lifecycle robustness (install/uninstall) + lock handling + branding cleanup

Priority: P0

## Problem
- Apps can report “already installed” after uninstall (especially keep-data / fast reinstall).
- Intermittent “Failed to fetch” during install/uninstall.
- “App busy / operation in progress” blocks uninstall; lock cleanup issues.
- CLI errors: `lock_dir: unbound variable`.
- Branding leaks: “ForgeOS” still appears in portal/scripts/messages.

## Scope
- CLI install/uninstall workflow + lock ownership and cleanup
- Better UX messaging for “data exists / restore” vs “already installed”
- Networking failures handling/retry/backoff
- Branding string audit and replacement

## Acceptance criteria
- Uninstall + reinstall flows:
  - clear messaging when data remains (restore vs fresh)
  - no false “already installed” errors
- Locking:
  - no `lock_dir: unbound variable`
  - stale locks cleaned safely on failure
  - UX indicates operation progress and retry guidance
- Branding:
  - no “ForgeOS” strings in portal or user-facing messages by default

