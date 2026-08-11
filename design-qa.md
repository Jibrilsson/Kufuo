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

---

# Kufuo shared member header and promotional banner — design QA

## Evidence

- Banner reference: `/var/folders/yl/5748p6413bb1rxb3g5243m540000gn/T/codex-clipboard-6fcba57c-4ea2-4a7e-87c4-6e9df41e145f.png`
- Header reference: `/var/folders/yl/5748p6413bb1rxb3g5243m540000gn/T/codex-clipboard-b61750d9-df73-4d00-ae87-b863f5dddd70.png`
- Kufuo implementation: `/private/tmp/kufuo-dashboard-banner-final.png`
- Combined comparison: `/private/tmp/kufuo-banner-comparison.png`
- Desktop viewport: 1280 × 720 px.
- Mobile viewport: 390 × 844 px.

## Visible comparison

The implementation preserves the reference structure: a compact single-row member header, a dark editorial promotion panel, one direct action, a right-side visual, carousel indicators, and a slim follow-up strip. It adapts the pattern to Kufuo using the existing Arabic logo, founder-collaboration illustration, white/black/lime palette, outlined controls, and founder-specific content.

## Interaction and responsive checks

- Verified the second carousel control replaces both the banner title and action.
- Verified the follow-up strip dismisses and leaves the main banner intact.
- Verified header search remains available on desktop and mobile.
- Verified the mobile header keeps logo, notifications, language, profile, search, and horizontally scrollable product navigation accessible.
- Shared header is applied to dashboard, discover, messages, connections, notifications, settings, account, public member profiles, and the new-opportunity form; public, login, legal, and onboarding pages retain their purpose-specific headers.

## Findings

- No actionable P0, P1, or P2 visual differences remain.
- The illustration uses a real existing Kufuo product asset rather than a placeholder or CSS drawing.
- Lint and production build complete successfully; remaining image optimization notices are pre-existing non-blocking warnings.

final result: passed

---

# Kufuo opportunities dashboard and settings — design QA

## Evidence

- Dashboard reference: `/var/folders/yl/5748p6413bb1rxb3g5243m540000gn/T/codex-clipboard-6c4e6fff-b160-48e0-9be0-4408481fc23f.png`
- Dashboard implementation: `/private/tmp/kufuo-dashboard-default.png`
- Dashboard comparison: `/private/tmp/kufuo-dashboard-comparison.png`
- Settings reference: `/var/folders/yl/5748p6413bb1rxb3g5243m540000gn/T/codex-clipboard-0bc5c16f-dd54-422e-8466-6427498c2d00.png`
- Settings implementation: `/private/tmp/kufuo-settings-default.png`
- Settings comparison: `/private/tmp/kufuo-settings-comparison.png`
- Desktop viewport: 1280 × 720 px; full-page screenshots captured at native browser density.
- Responsive check: 390 px CSS viewport with a 390 px document width and a single 358 px dashboard column; no horizontal document overflow.

## Full-view comparison evidence

The implementation follows the references' information hierarchy—compact global header, left identity/navigation rail, central opportunity list, right activity rail, and tabbed settings—while deliberately retaining Kufuo's own white canvas, black outlines, lime primary actions, and small controlled cyan/pink/yellow accents. The opportunity feed replaces social posts with startup-specific cards and a focused application action.

## Focused interaction evidence

- Verified Profile, Preferences, Security, and Account settings tabs render as distinct functional views.
- Verified preference switches expose correct checked states and connect to the existing saved member settings flow.
- Verified the opportunity application dialog opens from a specific startup card and contains contribution, commitment, and motivation guidance.
- Verified Arabic/LTR switching uses a hydration-safe shared language store and directional chevrons inherit the correct RTL treatment.

## Required fidelity surfaces

- Structure: reference hierarchy is preserved without copying the references' dark theme or advertising rail.
- Typography: Kufuo's established bold editorial headings and compact utility labels are preserved.
- Components: real Lucide icons, flat fills, black outlines, and intentional offset borders only; no generic gradients or decorative shadows.
- Content: realistic opportunity language replaces generic feed posts and makes stage, skills, founder, location, and application status scannable.
- Responsive behavior: rails collapse before the main feed, the header becomes a compact mobile stack, and the opportunity card becomes one column.

## Findings

- No actionable P0, P1, or P2 visual differences remain for this scope.
- The source references use denser, smaller typography; Kufuo intentionally keeps its existing editorial scale for brand continuity while the app header itself is compact.
- Supabase currently has no live idea records, so production will correctly show the designed empty state until members publish opportunities. The no-index demo route contains representative content for QA only.

## Implementation checklist

- [x] Compact signed-in header
- [x] Opportunity/application dashboard in place of social posts
- [x] For-you, newest, applications, and own-ideas views
- [x] Stage and text filtering
- [x] Idea-specific application dialog and database relationship
- [x] Profile, preferences, security, and account settings
- [x] Desktop and responsive visual QA
- [x] Lint, build, and Supabase schema verification

final result: passed
