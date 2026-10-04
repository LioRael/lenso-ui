# Docs UI source alignment

Baseline: `9fb31180e115591381ee733eb880ede8ec51fb0a`.

## Source authority

The visual rules combine the pinned reference's notebook composition and final
CSS overrides with its exact dependency defaults:

- [Reference source](https://github.com/heroui-inc/heroui/tree/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e):
  notebook `page/{index,toc-items,client}.tsx`, search toggle/dialog,
  `app/global.css`, MDX mapping and locale font layout.
- `fumadocs-ui@16.9.0`: search dialog, TOC viewport, notebook container, MDX
  mapping, `css/preset.css` and `css/lib/base.css`.
- `fumadocs-core@16.9.0`: heading observation and anchor selection.
- `@fumadocs/tailwind@0.0.5`: resolved prose/table rules.

Reference adaptations retain Apache-2.0 attribution. Fumadocs' original MIT
license is included in `src/components/fumadocs/LICENSE.FUMADOCS`. The docs shell
now directly uses Fumadocs UI/core and their Radix interactions. Its public
precompiled stylesheet is imported; no Tailwind compiler configuration is added.
See [FUMADOCS-INTEGRATION.md](FUMADOCS-INTEGRATION.md) for current evidence.

## Resolved rules

- TOC: threshold-0.9 multi-active observation, nearest-top fallback, most-recent
  current heading, measured active-link union excluding vertical padding,
  transparent navigation border, native masked scrolling and source indentation.
  The custom unroled thumb remains visible; a CSS comment about hiding another
  indicator is not sufficient to suppress it.
- Mobile TOC: public Fumadocs Collapsible, page title while open, current heading
  while closed, progress circle and chevron, scoped outside dismissal.
- Search: authored EN/CN advanced static indexes, matching Mandarin tokenization,
  and native Fumadocs dialog/selection/scrolling. Wrapping arrows, IME exclusion,
  pointer selection, Enter navigation and focus restoration remain required.
- Search motion: overlay entry 200ms / exit 150ms ease-out with blur/saturation;
  popup 300ms `cubic-bezier(0.16, 1, 0.3, 1)` with separate scale/opacity states.
  Reduced-motion animation durations are zero.
- Tables: shared native HTML styles for Markdown and API tables, 14px/24px,
  10px cells, separate borders with zero spacing, no outer card/dividers/zebra,
  header background and rounded first/last header ends.

The TOC ancestor grid reserves 268px while the aside uses the source's 240px
desktop width. `right: 0` does not remove its inherited end padding. The search
trigger has a single end-spacing owner. Short-height popup clipping and TOC
visibility/resize changes require scoped scrolling rather than document movement.

Official Babel/PostCSS scans docs and canonical component style sources together,
including server-only `prose.stylex.ts`; there is no manual server-only source list.
The API renderer keeps its semantic row headers and keyboard-focusable overflow.
Opaque native types, authored content and Copy Markdown serialization remain
unchanged by this UI slice. Live Table component demos are outside its scope.

## Verification boundary

Use Node 24.18.0, the current lock's dependencies and freshly rebuilt local
UI/tokens packages. Check production styles, not merely emitted declarations:

- EN/CN, light/dark, desktop/mobile, plus short-height and breakpoint changes.
- Ordinary top/scrolled thumb bounds and multiple simultaneous active headings.
- Command keyboard/pointer navigation, IME, focus containment/restoration,
  empty results and actual scrolling to the selected row.
- Open-command and expanded mobile TOC axe semantics, retaining only the existing
  color-contrast exception.
- Both table renderers' computed styles, horizontal keyboard scrolling,
  viewport overflow and exact Markdown copy.
- Existing `test/native-api.browser.mjs` and `scripts/browser-check.mjs`.

Earlier captures and checks from the initial implementation are historical:
they do not certify subsequent boundary fixes. This document is source rationale,
not a passing report. Final current-source commands and results must be recorded
separately.

No rendered pinned-upstream comparison or official pixel parity is claimed.
Static indexes introduce a real loading lifecycle and heading/content matching.
Queries run in the browser after fetching the generated locale asset, without a
runtime `/api/search`, foreign service filters or paid-product actions.
