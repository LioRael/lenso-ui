# HeroUI-style Lenso homepage

## Authority and scope

The user requested a homepage reconstructed from HeroUI. Source authority is
HeroUI v3.2.6, commit `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`:
`apps/docs/src/app/[lang]/(home)/page.tsx`, its layout, `demo-showcase.tsx`,
`components/demo/index.tsx` and `components/footer.tsx`. These Apache-2.0 sources
are adapted to Lenso's native contracts and StyleX, with notices retained.

Fresh browser references are `https://heroui.com/` at 1440 × 1000 and 390 × 844,
with its Pro advertisement dismissed. Deployed SHA is unknown. Source structure
and current rendering agree, but this is not proof of the exact deployed pin.

One design owner sets the geometry below. Reuse the existing local component
mosaic and Dashboard/Mail/Chat/Finances; do not make agents independently invent
new demo interfaces. This first representative includes navigation, hero,
showcase and footer. There are no extra feature, pricing or testimonial sections.

## Identity and genuine destinations

Use the existing Lenso UI wordmark, Inter asset and semantic theme variables.
No new logo, photography, decorative asset or font is needed.

The release pill reads `Lenso UI 0.9.0 · Source candidate`, sourced from product
version rather than a separate release constant. Do not claim npm publication,
React Native support, paid templates, customers, star counts or an AI service.
Replace the small star-count line with a genuine repository link.

Navigation: Docs, Themes, Components, Agent tools. All link to existing authored
Lenso destinations. Header includes real documentation search, the existing
header theme preset picker, light/dark/system control, locale switch and GitHub.
Use native Fumadocs HomeLayout navigation/search behavior with presentation
overrides; ordinary controls remain Lenso parts.

English hero title preserves the two-line reference:
`Beautiful by default.` / `Customizable by design.`
The description describes React components, native interactions and StyleX,
not HeroUI's React Aria/Tailwind implementation or mobile offering.
Primary and outlined CTAs lead to getting started and component documentation.
Chinese routes use authored equivalent copy and real localized destinations.

## Geometry and type

- Navigation is 56px high, max layout width 1400px, 24px horizontal gutters.
  Logo is about 28px/600; links 14px muted, compact 8px link gutters.
- Main is a column with source minimum `calc(100vh - 64px)`. Hero starts 48px
  below navigation and has 16px horizontal gutters.
- Hero content max-width 672px; centered release pill, 16px desktop gap to title.
  Title 48px/48px bold with tight tracking at >=1024px, 36px at >=640px,
  30px/36px below640px. First line foreground, second muted.
- Description is centered, balanced and muted, 18–20px/28px desktop and
  16px/24px phone. Preserve a two-line desktop measure without filler copy.
- CTA row margin-top16px, gap12px, compact pill links about36px high.
  Repository line 12px/20px, 16px top margin desktop.
- Showcase max-width1200px, centered. Outer vertical padding40px desktop,
  24px below1024px. Desktop toolbar has8px horizontal padding and16px bottom gap.
  At1440px reference: toolbar starts aroundy420; frame starts aroundy476.
- Components panel has32px vertical padding, source rounded2xl, subtle desktop
  border and minimum420px. Existing mosaic retains its exact responsive group
  order and sizing; do not constrain it to a generic equal-card grid.
- The source Components panel provides intrinsic frame height even when a
  template covers it. Preserve stable desktop frame height across preview tabs
  without duplicating interactive demos or exposing inactive controls.
- Footer is a centered wrapping row with8px gaps and12px vertical padding.
  Use product version, Docs, GitHub and coverage links, not nonexistent company
  policy/social destinations.

Colors are existing `--background`, `--foreground`, `--muted`, `--default`,
`--surface`, `--accent` and native state pairs. No new global token catalog.
Energy1, rhythm2, motion1: the live component mosaic is the focal point; no
invented entrance animation or decorative gradient.

## Showcase interactions

Desktop >=1024px has native horizontal Tabs: Components, Dashboard, Mail, Chat,
Finances. Associated native Panels preserve mounted local state. No CRM placeholder
and no remote Pro iframe. Inactive demos must be excluded from focus and the
accessibility tree.

Reuse the existing local preview components. Components sets the natural frame
size; the four applications fill the frame with their own scroll ownership.
Do not let tab changes jump the footer or stretch the frame to an arbitrary app
height. Responsive measurements must recover after resizing hidden previews.

Eight reference accent colors:
`#FF81B9`, `#FF8289`, `#FF9A00`, `#DCBE00`, `#72DB5A`, `#00D7FF`, `#5DBFFF`,
`#A8ABFF`. Visual swatches are20px with32px hit areas and native focus behavior.
Color changes affect the showcase and its portals, not a new global preference
owner. The existing header picker owns global preferences independently.
The palette link opens the actual Theme Builder with the selected accent seed.

Below1024px hide the toolbar and show Components, matching the reference; preserve
desktop app state for return. Mobile navigation remains native and all meaningful
links and mode/locale controls remain reachable. No page overflow at320px or RTL.

## Routes and proof

The real homepage replaces the root redirect. Provide `/`, `/en` and `/cn` with
appropriate document language, metadata, canonical/alternate links and static
export. It must not live inside the documentation sidebar shell. Preserve docs,
coverage and Theme Builder routes. Navigation back to home should use real links.

Inspect the real production render at1440×1000 and390×844, both themes, plus
768/320px and RTL. Verify CTA/search/locale/menu/preset/mode behavior, native tab
and panel relationships, persistent sample state, stable frame sizing, accent
inheritance into overlays and mobile fallback. Automated checks establish behavior,
not user approval or pixel-identical proprietary content.

## Implemented result and current evidence

The homepage is statically exported at `/`, `/en` and `/cn`; English canonically
uses `/`. The page owns one main landmark, with navigation and footer outside
it. The native layout container is presentation-only rather than another main.
Its minimum-height composition adapts the source to that semantic structure.

The Components mosaic remains the single intrinsic sizing owner. At 1440px the
production frame starts at x120/y476, is 1200px wide, and is 846px tall. Its height
comes from the existing live demos, not a fixed approximation of the reference.
The reused mosaic still contains upstream-branded reference sample content;
those profile statistics are not claims about Lenso. No additional CDN assets or
commercial template source were imported for the homepage.

Inactive application dialogs and popovers close through native controlled
lifecycle callbacks and return focus to the visible Components panel. Sample
records remain mounted. Tablet menu preferences remain accessible. Search has
one provider across responsive trigger relocation, with visible-trigger focus
fallback. Compact search icon geometry is covered separately from click behavior.
Header action branches are both server-rendered and CSS controls their responsive
visibility; mode and locale controls must be available before JavaScript loads,
not inserted after a client-only viewport subscription.

The reported currency hydration failure and executable-script warning were
reproduced together with browser locale `en-GB`: server `$250.00` versus client
`US$250.00`. The sample Price Slider now explicitly uses `en-US`, matching the
other USD preview formatters. Cross-locale browser coverage (`en-GB`, `zh-CN`)
checks initial output, native keyboard updates and accessible value text on
both homepages and Theme Builder, and rejects hydration/script warnings. The
warning disappeared with the formatting fix; no warning suppression or
bootstrap replacement was introduced.

Current local verification:

- Repository oxlint: zero warnings/errors.
- Production docs build and TypeScript: passed; 313 static pages exported.
- Complete maintained docs browser suite: passed, including homepage routing,
  metadata, search, tab/panel relationships, stable frame sizing, local overlay
  dismissal on resize, tablet preferences, 320px/mobile and RTL checks.
- Server-rendered chart titles are checked before hydration. Single-string SVG
  title children fix the React 19 empty-title server/client mismatch.
- Homepage axe checks exclude color contrast; they are not full WCAG approval.
- `git diff --check` passed; `packages/primitives` has no changes.
- Fresh production desktop and phone screenshots were captured in both themes.
  Render comparison establishes the implemented layout, not user approval,
  deployed upstream revision identity, or exact commercial-template parity.

No publication, authoritative candidate CI, or landing is claimed by these
local results.
