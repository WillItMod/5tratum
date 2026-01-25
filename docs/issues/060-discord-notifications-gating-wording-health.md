# Discord notifications (spam gating + wording consistency + health)

Priority: P1

## Problem
- Discord spam triggered by transient hashrate drops.
- Wording mismatch: “not-created” should be presented as “not running” consistently.
- Need a service health check.

## Scope
- Alert smoothing/gating logic
- Message templates (UI + Discord)
- Discord integration diagnostics endpoint

## Acceptance criteria
- Hashrate drop alerts require a sustained condition (e.g. 5 samples over 5 minutes) before notifying.
- No alerts for single transient drops.
- “not-created” is mapped to “not running” consistently in:
  - UI status
  - Discord notifications
- Add a simple Discord health check:
  - verifies webhook configured
  - verifies a test message can be sent (optional gated button)

