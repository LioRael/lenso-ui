# Documentation shell adaptation

Authority: HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, Apache-2.0.

## Current native Fumadocs integration

The bounded follow-up uses actual `fumadocs-ui`/`fumadocs-core` **16.9.0**,
matching the pinned HeroUI release. The user explicitly authorized the docs-only
Radix/precompiled-CSS exception. Component library packages remain Base UI/StyleX.
`RootProvider` uses Next's framework bridge beneath the existing theme provider;
its duplicate theme/search providers are disabled. The locale-specific shell
owns one real Fuma `SearchProvider`, native dialog parts and static `useDocsSearch`.
Core TOC observation/anchors and native MDX heading/table components replace the
copied mechanics. The retained notebook rail/resize styles and other adaptations
still carry their original licenses.

Only the exported `fumadocs-ui/style.css` is imported; `css/preset.css` requires a
Tailwind plugin and is not used. No Tailwind compiler is added. Native package
dependencies include `tailwind-merge` and `@fumadocs/tailwind`; this is not a claim
that the dependency graph contains no Tailwind-related packages.

Search assets are built from the authored index only, using the public advanced
search exporter and matching public Mandarin tokenizer on server and static client.
They are `/search/en.json` and `/search/cn.json`, not `/api/search`. Native API facts,
locale routes, existing heading IDs and exact copied Markdown stay authored.
Current verification and explicit package compatibility limits are recorded in
`apps/docs/test/FUMADOCS-INTEGRATION.md`. The earlier adaptation notes below are
historical context, not proof of the current package-backed integration.

## Source and local structure

- `layouts/notebook/{index,sidebar,page}.tsx` follows upstream's notebook
  header, sidebar page tree, page TOC, and mobile disclosure structure.
- `ui/{search-dialog,language-toggle,theme-toggle}.tsx` replaces upstream
  Fumadocs/Radix interaction mechanics with the local native Base UI
  projections. Local component styles are supplied through `xstyle`, not
  `className`. Date, time, and color live demos retain their separate
  React Aria boundary.
- `src/styles/docs.stylex.ts` and `notebook.stylex.ts` translate the source
  notebook utilities and `apps/docs/src/app/global.css` overrides to StyleX.
  The source's final override is **220px**, not the notebook's earlier 268px
  sidebar default. The 1,400px grid reserves 268px for the 240px desktop TOC.
  Built library maps and consumer maps must both use StyleX `dev: false`.
  The compiler's debug property keys differ from production keys and break
  cross-package `xstyle` overrides. `devMode` only controls Vite middleware;
  it is not that compiler switch.
- `component-links.tsx`, `upstream-reference-icons.tsx`,
  `ai/page-actions.tsx`, and `component-source.tsx` adapt upstream reference
  pills, source-product icons, Markdown actions, and vertically stacked code.
- `[lang]/layout.tsx` is a locale root, as in the source. Nonlocalized utility
  routes have a separate `(utility)` root sharing `document-layout.tsx`.
  Public URLs are unchanged; `/cn` emits `html lang="zh-CN"` server-side.
  Navigation between roots intentionally causes a full document navigation.

The top 32px paid-product promotion is replaced by independent-derivation
attribution and a coverage link. Lenso branding remains Lenso branding.
The version menu links to the pinned source and reconstruction coverage; it
does not invent other supported versions. Web is presented without a fake
local Native destination. The source's Pro, AI services, custom-theme builder,
and newsletter publishing controls are not offered as working local products.

## Content and preview contracts

The shared source index, navigation metadata, relationships, and live manifest
remain the source of truth. The route still uses `getNavigation`, `getPage`,
`readPage`, `pageUrl`, and `getMDXComponents`. It retains the local installation
instructions and every imported page.

Live previews read their **actual local module** for the source pane. Other
previews display the preserved source record and an explicit non-working-demo
notice. Source-pane clipboard actions copy the raw module/record, without
line numbers. Markdown actions copy the complete page source, including
frontmatter. External reference pills identify upstream products, not local
API compatibility.

`next-mdx-remote` v6 defaults to removing JSX expression props. That produced a
real 500 on the colors handbook because literal `colors`, `lightColors`, and
`darkColors` arrays disappeared. The page compiler now allows expressions only
for the integrity-checked pinned local MDX, retaining `blockDangerousJS: true`.
Do not reuse that compiler configuration for user-supplied or remote MDX.

## Verification and measured differences

Real Chromium captures compared
`https://heroui.com/en/docs/react/components/button` with a controlled local
Next 16.3.1 webpack development server at **1440×900** and **390×844**, in
light and dark themes. Diagnostic screenshots were kept in scratch, not
added as product assets. These measurements are not pixel certification.

Desktop measurements after adaptation, in both themes:

| Geometry                 | Official reference     | Local |
| ------------------------ | ---------------------- | ----- |
| Header x/y/width/height  | 20 / 32 / 1400 / 100   | same  |
| Sidebar x/y/width/height | 20 / 132 / 220 / 768   | same  |
| Main x/y/width           | 240 / 132 / 912        | same  |
| TOC x/y/width/height     | 1152 / 132 / 240 / 768 | same  |
| Search x/y/width/height  | 496 / 44 / 400 / 32    | same  |
| Title x/y/height         | 288 / 164 / 42         | same  |
| Usage heading y/height   | 334 / 31.984           | same  |
| First preview x/y/width  | 288 / 452.547 / 816    | same  |

Mobile header geometry is 0 / 32 / 390 / 92. Main content starts at y=180;
title is x=24 / y=196 / height=42; prose/preview width is 342px.
The source's reference pills are 36px tall on mobile and 32px on desktop.
Mobile Usage y=438 and first-preview y=556.547 also match the reference.
Both captured local themes have no document-level horizontal overflow.

Remaining differences:

- `DocumentLayout` now loads the genuine Google Fonts variable Inter, with
  the immutable source, SHA256 and OFL license recorded beside the added font.
  Imported static fonts remain unchanged. Disabling automatic optical sizing
  preserves the source's text optical metrics: “Button” measures **89.09375px**
  in both themes at 1440px and 390px, matching the official reference.
- The local first preview's full pane is taller than upstream because its
  actual adapted source is longer. The preview scene remains 350px; source is not
  truncated or replaced to conceal the difference.
- Live and preserved source now use server-only Shiki 3.20.0 and the source
  Fumadocs default `github-light` / `github-dark` themes. `MDXCodeBlock`
  provides the same projection for fenced blocks; the parent-owned MDX map
  must register it as `pre`. Browser checks of that integration in a scratch
  harness measured actual import-token colors `#D73A49` / `#F97583`.
  Clipboard retains every raw character, independent of highlighted display.
- Local source follows real relative import/export edges, including re-export
  entry files and StyleX helpers. File buttons select the actual file and copy
  that file; preserved upstream records are never substituted for local files.
  The source's compact collapse/expand code presentation is still not ported.
- Sidebar rendering supports exact `new` / `updated` / `preview` metadata
  chips and native Base UI folder disclosure. The parent-owned navigation
  reader must supply `status`, `statusLabel`, `children`, and `defaultOpen`
  from source facts; this renderer does not invent category folders.
- Color handbook helpers now follow source nested base/soft panels, two theme
  columns, stacked theme rows, full-width primitive swatches and nested form
  field blocks. At 390px, columns and form blocks stack and primitive rows
  wrap. All 96 color-copy controls render without horizontal overflow.
  Swatch metadata uses the native Base UI tooltip contract with immediate
  opening and the source monospace presentation. Source OKLCH clipboard
  conversion is not reproduced: copies use the browser's computed CSS color.
  That is an explicit remaining difference.
- Omitted service/product controls are intentional scope exclusions, not
  proof of full upstream feature parity. Advanced demo parity is separate.

`test/shell.browser.mjs` exports `checkDocumentationShell(page, base)` to
replace the old shell assertions in the existing browser proof, while leaving
its live-demo assertions intact. It proves native theme arrow navigation,
actual CSS theme changes, search input focus/results/empty state/shortcuts/
Escape restoration, result navigation, same-slug language switching, server
locale/canonical metadata, mobile drawer focus containment/restoration/
navigation, overflow, and surviving MDX color arrays.

The controlled browser run also checked actual Markdown, local-source, and
preserved-source clipboard contents. Semantic axe checks passed with no
violations after making long code panes keyboard-scrollable; source-color
contrast was excluded, not certified. Type generation and docs TypeScript
checking passed against the parent-built packages; scoped oxlint passed with
zero warnings/errors. React Doctor reported 100/100 with no findings, then
waited at its optional interactive CI-install prompt. Production build and
the combined live-demo browser proof are the parent integration check, not
claimed by these shell-only results.

## Additional presentation proof

A scratch Next harness used read-only dependencies and font assets from the
parent checkout, with the new fenced-code mapping explicitly registered there.
It did not modify parent configuration or dependencies.

The expanded shell browser check passed, including actual raw local-source
clipboard equality, dual-theme token colors, code-pane keyboard focus and
native RTL theme-group ArrowLeft behavior after changing the document `dir`.
Both button and colors pages were captured at 1440×900 and 390×844 in both
themes with zero document overflow and no client exceptions. These checks do
not certify every example, every folder state, or production behavior.

Final button scene bounds match the reference in both themes: desktop
`288 / 452.546875 / 816 / 350`, mobile `24 / 556.546875 / 342 / 350`
(x / y / width / height). The preview supports the actual pinned MDX
`align`, `minHeight`, `isBgSolid`, `description`, `hideCode` and
`style.contain` contracts through typed StyleX. No EN or CN archived preview
uses a `className` or `height` prop. The special skeleton containment override
is retained, rather than silently discarded.

A separate scratch fixture checked the real parent local accordion re-export
`controlled.tsx`, implementation `source.tsx` and `source.stylex.ts`: selecting
each file copied that file's exact bytes. It also proved folder Enter
open/close and `aria-expanded` state. This is renderer-contract evidence, not
proof that every parent navigation folder has been supplied or rendered.

The accent handbook helper was compared separately in both themes. Its local
theme column matches source **400×202px** on desktop (52px header and 142px
nested panels), and **342×412.5px** on mobile (64.5px header and 340px stacked
panels). Captures were scrolled to the helper, so their viewport y positions
are not a page-position comparison. These measurements cover that helper,
not every handbook swatch family.

Semantic axe checking (excluding the source palette's known contrast failures)
found repeated `API reference table` landmark labels in the parent-owned MDX
table mapping. Source-pane duplicate landmarks and the unlandmarked attribution
banner were corrected locally. The remaining parent mapping issue is not
reported as a passing axe matrix.
