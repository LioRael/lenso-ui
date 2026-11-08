# Native Fumadocs docs-shell integration

Fumadocs UI/core own the docs shell's native interactions; the component
library keeps its Base UI and StyleX boundary. Current dependency versions are
recorded in `apps/docs/package.json`.

## Ownership and compatibility

The public Next provider supplies framework/i18n/direction contexts.
`next-themes` owns theme state. Fumadocs search, TOC and Collapsible parts own
selection, scrolling, observation and dismissal. Local adapters handle visual
rails, viewport visibility and focus return; they do not copy these algorithms.

Docs import the package's precompiled `fumadocs-ui/style.css`, not its
compiler-only CSS preset. No Tailwind compiler or runtime styling system is added.

The advanced static search exporter and client use the same public Mandarin
tokenizer so generated search data and client queries agree.

## Search regression purpose

`bun run generate` produces authored EN/CN search assets. Public `structure()`
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

Keep native TOC observation, scrolling and mobile disclosure; locale-separated
search with keyboard and IME handling; focus restoration; reduced motion and
portalled themes; and semantic, keyboard-scrollable API tables and exact copying.
The maintained Bun tests do not establish the rendered geometry or browser
interaction of these behaviors.

## Reproduce

Use the workspace Bun toolchain:

```sh
bun run --filter @lenso/ui-docs generate
# From apps/docs:
bun test scripts/static-search.test.ts
bun run test
bun run build
bun run test:stylex-artifacts
```

The retired browser checks covered English desktop light and Chinese mobile dark,
native loading and empty results, IME, keyboard selection, navigation and
scrolling, focus restoration, TOC behavior and exact Markdown copying. Search fetches generated locale JSON,
not a runtime API.

The maintained Bun tests do not replace those browser checks. This document
records integration reasons and current commands, not a passing browser acceptance
snapshot.
