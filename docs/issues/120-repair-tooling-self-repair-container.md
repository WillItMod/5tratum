# Operational tooling: self-repair container + token support + channel switch

Priority: P3

## Problem
- Need a public GHCR self-repair container to apply a target version via SSH command.
- Must support private update repos (token download), plus manual token prompt fallback.
- Need a “switch to dev channel” command.

## Scope
- Repair container packaging + documentation
- Token handling in repair flow
- CLI helpers for channel switching

## Acceptance criteria
- Self-repair container can:
  - connect over SSH
  - apply a specified tag
  - validate running services afterward
- Token support:
  - reads from `/etc/5tratumos/update.token` if present
  - prompts if missing (non-interactive fallback documented)
- Simple channel switch command available and documented.

