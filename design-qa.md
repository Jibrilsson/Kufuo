# Kufuo legal pages — design QA

## Evidence

- Source visual truth: `/private/tmp/kufuo-legal-source.png` (current production community-guidelines page before this change)
- Rendered implementation: `/private/tmp/kufuo-legal-implementation.png` (local community-guidelines page after this change)
- Combined comparison: `/private/tmp/kufuo-legal-comparison.png`
- Viewport and CSS size: 1280 × 720 px
- Source pixels: 1280 × 720; implementation pixels: 1280 × 720
- Density normalization: none required; both captures use the same browser viewport and pixel dimensions
- State: signed out, English, top of page, navigation closed

## Full-view comparison evidence

The production source used a legal-only back link and logo. The updated implementation replaces that isolated header with Kufuo's standard public header, including the same logo, primary navigation, language control, and authentication actions as the landing page. A Home / current-page breadcrumb now sits directly below the header. The legal card, typography, line lengths, borders, and content hierarchy remain unchanged.

## Focused region comparison evidence

A separate focused crop was not needed: the changed header and breadcrumb occupy the top third of the 1280 × 720 comparison and all navigation labels, control boundaries, logo treatment, and breadcrumb text are legible at native scale.

## Required fidelity surfaces

- Fonts and typography: existing Geist hierarchy and weights are preserved; header and breadcrumb match the public navigation scale.
- Spacing and layout rhythm: the standard 1280 px site frame is used; the breadcrumb provides a compact transition into the narrower legal card without changing article rhythm.
- Colors and visual tokens: white canvas, near-black ink, neutral divider, and lime primary action reuse existing Kufuo tokens.
- Image quality and asset fidelity: the existing `/kufuo-logo.svg` is reused; no placeholder or reconstructed assets were introduced.
- Copy and content: legal content is unchanged; only the contextual Home / page-name breadcrumb was added.

## Findings

- No actionable P0, P1, or P2 visual differences remain.
- No P3 follow-up is required for the requested scope.

## Interaction and route checks

- Verified the public navigation, login, and registration destinations in the rendered DOM.
- Verified the shared header and breadcrumb render on `/community-guidelines`, `/privacy`, and `/terms`.
- Verified a clean browser-rendered load and DOM snapshot with no surfaced runtime error state.
- Responsive behavior reuses the landing-page header's existing navigation and mobile-menu classes; build and lint validation passed.

## Comparison history

- Initial source finding: legal pages used a page-specific back header and lacked breadcrumb context.
- Fix applied: replaced the page-specific header in the shared `LegalPage` shell with the standard public header and added a shared breadcrumb.
- Post-fix evidence: `/private/tmp/kufuo-legal-comparison.png` shows the requested standard header and breadcrumb while preserving the article composition.

## Implementation checklist

- [x] Standard public header on community guidelines
- [x] Breadcrumb under the header
- [x] Same shared shell on privacy and terms
- [x] Signed-in and signed-out header destinations supported
- [x] Desktop visual comparison completed
- [x] Build and lint completed

final result: passed
