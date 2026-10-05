# Native Fumadocs docs-shell integration

HeroUI v3.2.6 commit `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e` is the visual
reference. Fumadocs UI/core 16.9.0 own the docs shell's native interactions; this
exception does not change the component library's Base UI/StyleX boundary.

## Ownership and compatibility

The public Next provider supplies framework/i18n/direction contexts.
`next-themes` owns theme state. Fumadocs search, TOC and Collapsible parts own
selection, scrolling, observation and dismissal. Local adapters handle visual
rails, viewport visibility and focus return; they do not copy these algorithms.

Docs import the package's precompiled `fumadocs-ui/style.css`, not its
compiler-only CSS preset. No Tailwind compiler or runtime styling system is added.

Next's Webpack Babel transform misidentifies a locally bound `module.exports`
inside Fumadocs' precompiled `remove-markdown-*.js` helper as module-level CJS.
`next.config.ts` bypasses Babel only for that helper. Fumadocs is not included in
`transpilePackages`; StyleX extraction and normal Webpack caching remain intact.

The advanced static search exporter/client avoids Fumadocs 16.9.0's simple-client
database-shape mismatch. Both export and client use the public Mandarin tokenizer.

## Search regression purpose

`pnpm generate` produces authored EN/CN search assets. Public `structure()`
paragraph records retain their owning rendered heading IDs. Native API table
cells remain fully displayed/copied, but are not individually indexed: repeated
cells create excessive per-document frequency data.

Tests cover punctuation/Unicode/native API anchors, Chinese `安装` and `键盘`,
English queries, empty results and the prose-only `establish support` query.
The full client regression reads the generated assets; one guide per locale
exercises extraction without rebuilding both complete catalogs in unit tests.

Results retain native buttons and tab stops. Current-result state uses
`aria-current`, not invalid button `aria-selected`. Search is a native textbox,
empty results are a status, and the loading indicator reflects real query state.
There is no local arrow-key, IME or snippet algorithm.

## Reproduce

Use Node 26.10 and pnpm 12.9:

```sh
pnpm --filter @lenso/ui-docs generate
# From apps/docs:
pnpm exec tsx --test scripts/static-search.test.ts
pnpm build
pnpm start
# In another terminal, from apps/docs:
node test/fumadocs.browser.mjs
node test/docs-ui-regressions.browser.mjs
pnpm test:api-browser
pnpm test:stylex-build
```

`LENSO_DOCS_TEST_URL` selects the current static server. The browser matrix
covers both locales/themes, desktop/mobile, native loading and empty results,
IME, keyboard selection, navigation/scrolling, focus restoration, TOC/sidebar,
table overflow and exact Markdown copying. Search fetches generated locale JSON,
not a runtime API.

Reports and screenshots belong under ignored `test-results/`. This document
records integration reasons and runnable checks, not fixed route counts, build
timings, runtime archives or a passing acceptance snapshot.
