# Native Fumadocs docs-shell integration

Reference: HeroUI **3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`; Fumadocs UI/core **16.9.0**.
This is a docs-only integration, not a component-library interaction migration.

## Public API ownership

- `fumadocs-ui/provider/next` supplies the framework, i18n and Radix direction
  context. Existing `next-themes` remains the single theme owner.
- One locale-specific `SearchProvider` supplies shortcuts/open state. The public
  dialog parts own containment, dismissal, selection, scrolling and navigation.
  `useDocsSearch({type: "static"})` loads `/search/{en,cn}.json`.
- Fuma's `TOCProvider`, `TOCScrollArea`, public Collapsible parts and core
  `TOCItem`, `useActiveAnchor` and `useActiveAnchors` own observation, ordinary
  scrolling and disclosure. Only the visual rail and viewport-resize visibility
  adapter remain; they do not choose active headings or scroll the document.
- Native MDX headings/tables use Fuma exports with final HeroUI prose styles.
  The named, focusable outer table section keeps Safari keyboard overflow.
  Authored native API rows, navigation, locale roots, heading IDs, source panes and
  exact `Copy Markdown` remain unchanged.

## CSS and actual package limits

The npm package exports `fumadocs-ui/style.css` as `dist/style.css`, fully generated
CSS. It has no compiler-only `@tailwind`, `@theme`, `@apply`, `@source` or `@plugin`
directives. `css/preset.css` does contain `@plugin` and is not imported.
No Tailwind compiler/runtime styling system was configured. Transitive
`tailwind-merge` and `@fumadocs/tailwind` helper dependencies are present.

The public search hook dynamically references all official backend modules.
Next **16.3.8**'s Babel `plugins/commonjs.js` interprets a locally bound
`module.exports` inside Fuma's precompiled `remove-markdown-*.js` as a module-level
CJS assignment, destroying its ESM `t` export. Native ESM bytes are valid.
Fuma was never added to `transpilePackages`. Forced ESM parsing alone and Babel
`ignore` did not fix the build: Next's `getFreshConfig` uses placeholder filenames
and does not forward `ignore`. A narrow `oneOf` exception skips only this published
helper's Babel transform. No dependency bytes, backend or hook were replaced;
StyleX still uses the official Babel/PostCSS integration and normal cache.

Fuma **16.9.0**'s simple static client passes `{type, db}` to `searchSimple`, which
expects the raw DB. The exported-client regression reproduced the resulting
`Cannot read properties of undefined (reading 'index')`. The supported advanced
exporter/client path avoids that bug. No copied search implementation was added.

## Static search and semantics

`initAdvancedSearch(...).export()` builds locale-separated authored assets.
`structure()` supplies native heading and paragraph text records.
Native API table cells are deliberately not independently indexed: the thousands
of repeated cells produced excessive Orama per-document frequency data. Their
facts remain displayed/copied in full. Page/section matches share the renderer's
`headingId` module. Public remark-heading options disable foreign custom-ID syntax;
native API section/part IDs map to their actual rendered IDs. Callback-state
headings have no rendered ID and are not indexed as anchors. Paragraph matches
retain their owning canonical heading. There is no archive/product endpoint migration.

Orama's default tokenizer did not match Chinese `安装` or `键盘`; an unsupported
`language: "cn"` was not assumed. Public `@orama/tokenizers/mandarin` **3.1.18**
uses ICU word segmentation and is configured identically at export and load time.
Exported-client tests prove `安装` finds Quick start and `键盘` finds Kbd;
EN `Button` and `Quick start` also match. The empty nonsense query returns no hits.
Generated assets are ignored and recreated during preparation.

Native Fuma result buttons remain buttons and keep their native tab stops.
The supported `aria-selected={undefined}` override removes invalid selected-state
ARIA on a button. Public `useSearchList` projects native virtual selection as
`aria-current="true"` (current result, not a claim that its page is visited).
No local selection/arrow-key/IME algorithm exists. The input is a native textbox,
not a fabricated combobox. Empty results are a status output, not a listbox with
missing options. The native loading icon reflects actual query state. A small
focus-return adapter restores the invoking element because programmatic
SearchProvider triggers are not Radix `DialogTrigger` elements.

## Reproduction

Use Node **24.18.0**, this lockfile and current own-source package builds:

```sh
pnpm --filter @lenso/tokens build
pnpm --filter @lenso/ui build
pnpm --filter @lenso/ui-docs build
pnpm --filter @lenso/ui-docs start
# From apps/docs, against that static export:
node --test scripts/static-search.test.mjs
node test/docs-ui-regressions.browser.mjs
node test/fumadocs.browser.mjs
node test/native-api.browser.mjs
node test/stylex-build.mjs
```

`LENSO_DOCS_TEST_URL` selects the static server. Evidence defaults to
`test-results/fumadocs` and `test-results/docs-ui-regressions`.
The matrix covers EN/CN × light/dark × 1440/390 width, current screenshots,
TOC/mobile sidebar, matched/empty search, IME, keyboard focus, static-only requests,
native API table overflow, authored clipboard and metadata.
A held actual JSON request proves native loading followed by results.
The only axe rule disabled is the existing source-color contrast exception;
no new accessibility exclusions are added.

## Verified Node 24 snapshot before the body-row follow-up

The prior **Node 24.18.0** cold/warm Webpack builds exported **309 routes**.
Cold compile/SSG: **57s / 55s**; unchanged warm: **10.0s / 41s**.
Full cold/warm StyleX reports matched, including atomic CSS bytes:
`ab4dc8e38fe87477.css`, SHA-256
`e1ba62730c0d7e57b74b5f6ef97577c2256610294becb7946e023c659ffd83eb`.
One union atomic asset, **1,934 rules** and **1,225 nonempty library identities**
were verified. Parsed selectors distinguish escaped Fuma `.xl\:` utilities from
StyleX hashes without weakening duplicate/keyframe/library-identity checks.

| Snapshot proof                       | Result                                                                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Eight locale/theme/viewport modes    | Current screenshots, matched/empty/mobile-TOC and held-loading axe passed; only existing color exception                                                     |
| Four maintained geometry regressions | 315px short viewport, centered popup, 400px trigger + one 48px wrapper margin, responsive TOC without document movement                                      |
| Keyboard and authored content        | Shortcuts, arrows, IME, navigation, Escape/focus return; exact StyleX/framework Markdown; `Next.js` result navigates/scrolls to rendered `frameworks#nextjs` |
| Native API                           | 16 production cases: exact facts/generics, copied API Markdown and no document overflow                                                                      |
| Exported client/anchors              | Three tests: Chinese `安装`/`键盘`, EN `Button`/`Quick start`, empty and punctuation/Unicode/native API IDs                                                  |
| Static projection                    | All 200 authored documents in export/sitemap; EN JSON 2,719,105 bytes, CN 2,759,163 bytes; one matching JSON per matrix document, no search API              |
| Source details                       | ESC Kbd 14px/24px/8px radius; native platform hints; actual Radix backdrop open/closed 200ms/150ms, native popup 300ms; reduced motion disabled              |
| Boundaries                           | Root/scoped oxlint and root oxfmt; existing Autocomplete six browser cases; 14 primitive source files byte-identical                                         |

Evidence: `test-results/fumadocs`, `docs-ui-regressions` and
`fumadocs-final-{cold,warm}`. Local no-telemetry React Doctor reported zero errors
and six retained lookup/preparation/page/demo warnings; no score is claimed.

The workspace-only official Node archive was verified before execution:
`node-v24.18.0-darwin-arm64.tar.gz`, SHA-256
`e1a97e14c99c803e96c7339403282ea05a499c32f8d83defe9ef5ec66f979ed1`.
After final validation its owned `test-results/runtime-node24` directory is removed
at the user's request; version/checksum evidence remains outside that directory.
Intermediate Node 26.10.0 runs after a provider change are not the Node 24 snapshot proof.

## Body-row follow-up: current source, Node 26.10.0

The earlier type filter retained owning-page hits for prose queries but incorrectly
hid Fuma's text rows. It is removed: page, heading and text results now all use
native rendering, selection and navigation, matching pinned HeroUI's ordinary
search list. HeroUI's search module and actual Fuma 16.9 text renderer have no
line-clamp rule. No invented clamp or JS snippet algorithm was added.

The small index adaptation removes page-wide text aggregation and retains public
`structure()` paragraph records instead. This makes deep matches visible in their
actual paragraph rather than clipping the beginning of an entire page.
The existing heading mapping and table-cell exclusion are unchanged.
New assets: EN **5,995,836 bytes**, CN **6,212,591 bytes**, both below Cloudflare's
25 MiB file limit, which the exported-client regression now checks.

Current installed **Node 26.10.0** built all **309 static routes**
(compile **16.1s**, SSG **84s**). Three exported-client/anchor tests, the four
maintained geometry regressions and the eight-mode shell/axe/IME/focus/loading/
motion/clipboard matrix passed against that changed-source export.
The body-only query **`establish support`** is absent from the target title/headings,
returns a native text row, exposes its highlighted `establish` inside the scrolling
viewport, and native arrow/Enter operation navigates and scrolls to rendered
`frameworks#other-frameworks`. New screenshot:
`test-results/fumadocs-body-followup/browser/prose-only-native-result.png`.
All current follow-up evidence is under `test-results/fumadocs-body-followup`.
The Node 24 temporary runtime remains removed; no new download/dependency was added.
Node 24 cold/warm and native API 16-case evidence above belongs to the explicitly
identified prior snapshot, not a fabricated rerun of the changed source.

An intermediate unchanged build hit route timeouts under unrelated parallel
Rust/wasm load; one bounded retry succeeded without changing workers/timeouts or
touching unrelated processes. Intermediate failures are not passing evidence.
No pixel-parity certification or full 5,456-test suite result is claimed.
