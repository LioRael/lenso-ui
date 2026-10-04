# Source-backed documentation

This application starts from HeroUI v3.2.6 commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`. It does not consume the deleted
Lenso catalog, content collections, playground, registry, or templates.

## Import and build

`pnpm --filter @lenso/ui-docs import:upstream --source /path/to/reference`
reads an already checked-out, clean, pinned reference. It uses Git objects, not
untracked filesystem contents. Other revisions are rejected before writing.
The generated `content/docs/{en,cn}/react` tree keeps all 176 pages per locale
and every source `meta.json`. Build integrity is checked against per-file SHA-256
digests and the source index digest; ordinary builds do not fetch GitHub.

Registered examples live as source content in `content/examples/{en,cn}`.
Native-product examples retain explicit exclusion records, not executable Native
code. Unregistered TSX helpers are preserved too. Fonts and documentation images
are imported from the same revision, without copying HeroUI's branding metadata.

`pnpm --filter @lenso/ui-docs build` uses Next's webpack backend with the StyleX
unplugin and no CSS layers. `dev` uses the same compiler path. The app imports
the compiled sibling `@lenso/tokens` CSS, not Tailwind.

## Extend live demos

1. Adapt the pinned source example in
   `src/demos/en/<upstream-family>/<example>.tsx` using the local `@lenso/ui`
   contract and StyleX. Keep one named exported demo per file.
2. Match the pinned record's exact relative file path. Unrelated files are not
   registered; historical source aliases resolve to the same module.
3. Run `node scripts/prepare-docs.mjs`. It derives `src/demos/live-manifest.json`
   and the independently loaded `src/demos/generated.ts` registry. Do not edit
   either generated file.
4. Typecheck and build against the rebuilt sibling packages. A registry entry
   alone does not prove runtime parity.

The source viewer reads the **local live module** when an adaptation exists.
Otherwise it explicitly identifies upstream source-only content. Never count
source-only records, registry aliases, or modified basic scenes as complete
upstream demo replication.

Ordinary APIs use native Base UI contracts. Dates, time, and color use explicit
local React Aria parts: e.g. `DateField.Label`, not the ordinary Base UI
`Label`. Native Tabs indicators are List siblings, not children of every Tab.

## Verification

- `test` covers imported-content protection, native API/clipboard projection,
  locale registration/provenance, translation safety and coverage accounting.
- `typecheck` runs preparation, Next route type generation, and TypeScript.
- `test:browser` targets an already running app at `LENSO_DOCS_TEST_URL`
  (default `http://127.0.0.1:3000`). It checks activation, disabled state,
  semantic theme propagation, title search, keyboard tabs, mobile disclosure,
  overflow, and accessibility semantics. Source-color contrast is intentionally
  assessed separately, not waived as a passing contrast result.
- `test:api-browser` checks native API tables and Copy Markdown on English and
  Chinese Button/DatePicker pages in both themes at desktop/mobile widths.
- `test:locale-browser` checks selected source-backed EN/CN interactions,
  including all four disclosure scenarios, against a running production build.
  Disclosure checks cover native expansion, controlled navigation, Arrow/Home/End,
  render composition, source-specific Chinese content and exact source clipboard.
  It records the build ID,
  manifest hash and per-case results in `src/demos/locale-proof.json`; screenshots
  and a report go under `test-results/docs-locale`. This is targeted evidence,
  not acceptance of every translated example.
- `test:examples` refuses incomplete source/locale coverage by default, then
  checks each registered scenario in desktop/mobile light/dark modes, including
  RTL/reduced motion, client errors, scene geometry and semantic accessibility.
  It writes a per-scenario report under `test-results/docs-examples`.
  `--partial --locale en --families button,tabs` is a development-only subset,
  never evidence of full completion. Add `--screenshots` for scene captures.

`node scripts/chip-scroll-browser-check.mjs` targets both real Chip matrix
scroll owners on the Chip and v3.1.0 release pages, in EN/CN and all four
display modes. It checks actual overflow, forward/reverse Tab reachability,
visible focus, native directional Arrow scrolling and whole-page axe.
`--baseline /path/to/red/report.json` also requires unchanged compiled scene,
matrix and Chip geometry. The default output is `test-results/chip-scroll`.
The full example check checkpoints its report after every page and logs
cumulative mounts/failures; interrupted output is not a completed acceptance run.

The browser commands use `LENSO_DOCS_TEST_URL`, defaulting to
`http://127.0.0.1:3000`. Build and start the app before running them.

`/coverage` distinguishes page preservation, registered source, deliberate
exclusions, translated projections, evidenced source-equivalent reuse and
English fallbacks. A visible English fallback is not Chinese coverage. It also
retains the missing preview already present in the pinned Chinese release notes.
Full upstream runtime, visual, and advanced-demo parity remains a separate
acceptance requirement.

## Disclosure archive omissions and public source

The four disclosure references were excluded from the imported Native-product
archive, not absent from HeroUI's pinned repository. `reference/disclosure-source.json`
is a read-only capture of all eight exact-revision EN/CN TSX files, preserving
the upstream Apache-2.0 notice and original code bytes. Preparation verifies each
URL, revision and SHA-256 offline. `capture-disclosure-source.mjs` is the explicit
public-network capture command; it is not part of preparation or builds.

The independent React implementations retain native Lenso/Base UI interaction
and shared EN StyleX geometry. Six existing implementation/style-helper inputs
and four generated CN outputs have reviewed pins; input, capture, provenance or
output drift fails closed. Basic modules resolve their translated local helper
graphs, which the source viewer exposes. Group Basic's download body differs
from Controlled's body in the pinned source; the shared CN helper preserves both.
The original QR image is promotional reference content, and source-handlerless
App Store/Expo actions stay handlerless. No excluded Native product is imported.

The archive records and source index are unchanged. Coverage reports deliberate
archive exclusion separately from `hash-pinned-public-upstream` availability and
`source-backed-localized` registration. Current counts are 682 EN and 682 CN
references, 681 unique modules per locale, 649 CN projections and 33 evidenced
equivalent reuses. The 471 partial/difference reports remain, so these counts
are not a full-text or pixel-parity claim. Historical acceptance snapshots retain
their original counts; current disclosure evidence is in `src/demos/locale-proof.json`.
