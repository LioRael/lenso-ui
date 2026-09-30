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

- `test` proves an unpinned source checkout cannot overwrite imported content.
- `typecheck` runs preparation, Next route type generation, and TypeScript.
- `test:browser` targets an already running app at `LENSO_DOCS_TEST_URL`
  (default `http://127.0.0.1:3000`). It checks activation, disabled state,
  semantic theme propagation, title search, keyboard tabs, mobile disclosure,
  overflow, and accessibility semantics. Source-color contrast is intentionally
  assessed separately, not waived as a passing contrast result.
- `test:examples` refuses incomplete source/locale coverage by default, then
  checks each registered scenario in desktop/mobile light/dark modes, including
  RTL/reduced motion, client errors, scene geometry and semantic accessibility.
  It writes a per-scenario report under `test-results/docs-examples`.
  `--partial --locale en --families button,tabs` is a development-only subset,
  never evidence of full completion. Add `--screenshots` for scene captures.

`/coverage` distinguishes page preservation, registered source, deliberate
exclusions, local adaptations, and the missing preview already present in the
pinned Chinese release notes. Full upstream runtime, visual, and advanced-demo
parity remains a separate acceptance requirement.
