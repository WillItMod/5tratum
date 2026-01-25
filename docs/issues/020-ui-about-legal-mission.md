# About / Mission statement / Legal & Trademark

Priority: P2

## Problem
- Add About section in Settings with popup modals:
  - Mission statement (preserve paragraphs/spacing)
  - Legal & Trademark (from repo docs)
- Avoid high-contrast “retina-searing” styling for mission statement content.

## Scope
- UI modals + content storage
- Legal/trademark content sourcing (bundle assets)
- Footer copy updates

## Acceptance criteria
- About section exists in Settings.
- Mission statement modal:
  - preserves paragraphs and blank lines
  - readable colors (theme-aware or tuned defaults)
- Legal & Trademark modal renders `LICENSE`, `LICENSE_POLICY`, `TRADEMARK` content correctly.
- Footer includes the requested attribution text and donation addresses (final text provided by owner).

