# NGINX overlay staleness + SSL toggle safety

Priority: P0

## Problem
- Overlay proxy config can become stale inside running container after updates (routes break).
- HTTPS enable/disable has bricked portal multiple times; needs safer implementation and recovery path.

## Scope
- Update/deploy method for nginx config + portal assets
- SSL enable/disable flow (self-signed), redirects, and safe fallback
- “Proof via SSH first” workflow

## Acceptance criteria
- Overlay updates always take effect without requiring manual container surgery.
- HTTPS toggle:
  - enables HTTPS safely with self-signed certs
  - provides HTTP→HTTPS redirect
  - keeps localhost HTTP escape hatch
  - never bricks portal; recovery procedure documented and tested
- Validate via SSH first before shipping patch.

