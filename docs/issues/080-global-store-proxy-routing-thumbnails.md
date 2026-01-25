# Global/Umbrel store + proxy routing + thumbnails

Priority: P0

## Problem
- Global store apps failing to install/run (dependency/proxy/routing issues).
- Apps open on `IP:PORT` vs `/apps/<id>` routes; proxy correctness uncertain.
- Store sync UX issues:
  - slow loads
  - missing thumbnails/icons
  - “forgetting” items
- App rename consistency issues (old name/logo persists).

## Scope
- Store sync logic (timeouts, caching, retries)
- Proxy route generation and correctness for app web containers
- Assets repo usage and caching strategy
- Rename/branding consistency across store/sidebar

## Acceptance criteria
- Global store apps install and run reliably (include Bitaxe Sentry as regression test).
- Proxy routing:
  - `/apps/<id>/` routes serve the correct service container
  - no reliance on random exposed ports when proxy routing is enabled
- Store UX:
  - thumbnails/icons load reliably (with caching)
  - list load time is reasonable (explicit progress UI)
- Renames:
  - sidebar and store show consistent name/logo after reinstall/update

