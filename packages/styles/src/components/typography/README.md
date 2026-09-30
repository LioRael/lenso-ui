# Prose descendant styling

`typography.styles.ts` is the property source of truth for both primitives and
Prose. `typographyTypes` owns headings, paragraphs and inline code;
`proseElements` owns the remaining semantic elements.

StyleX cannot assign descendant targets from a container. Walking React children
does not solve that boundary: a custom component or injected HTML can introduce
semantic DOM after Prose renders. The narrowly scoped adapter in
`generate-prose.mjs` compiles the existing maps with StyleX, then associates their
emitted atomic rules with native tag selectors under `[data-prose-root]`. It does
not author a second set of CSS property values or inspect React children.

Generate before bundling the styles package:

```sh
node src/components/typography/generate-prose.mjs
```

Check the committed artifact without writing:

```sh
node src/components/typography/generate-prose.mjs --check
```

Both commands also work from the repository root with the `packages/styles/`
prefix. The compiler comes from the existing `@stylexjs/unplugin` dependency:
its Babel core and StyleX plugin, and Babel core's generator. No separate
runtime CSS processor is needed.

The React `Prose` component emits `prose.generated.ts` through React 19's
deduplicated, hoisted stylesheet mechanism. The generated string ships through
the existing typography JavaScript export; there is no stylesheet-copy step.
`data-prose="off"` and `.not-prose` opt native subtrees out. Custom diagnostic
`data-slot` values do not change the styling boundary.

The adapter preserves emitted pseudo selectors and media conditions and resolves
StyleX `defineConsts` references to their original public theme variables.
Edit the StyleX maps, not the generated artifact.
