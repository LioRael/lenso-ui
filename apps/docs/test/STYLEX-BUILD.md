# Docs StyleX build regression

The documentation app compiles application and shipped tokens/docs declaration
modules with the official StyleX plugins. The PostCSS configuration is
in `apps/docs/postcss.config.cjs`; the production export must include the
resulting rules without duplicate atomic output.

After building the documentation, inspect the generated styles and PostCSS
rebuilds without starting a browser or server:

```sh
bun run --filter @lenso/ui-docs test:stylex-artifacts
```

For delivery changes, serve the production export and inspect the affected pages,
including server-rendered content with JavaScript disabled. Artifact checks cover
theme delivery, library rules and keyframes, one deduplicated atomic stylesheet,
RTL selectors, server-only API styles and PostCSS declaration/constant edits.

This is a scoped production delivery and incremental-build check; it does not
certify every development invalidation path or browser rendering state.
