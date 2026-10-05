# Docs StyleX build regression

The docs app uses the official Next.js Babel/PostCSS integration to compile one
source union: `apps/docs/src` and canonical `packages/styles/src`, including
server-only declarations. This is a monorepo configuration, not a consumer recipe
for precompiled packages.

`babel.config.json` supplies matching compiler options to Next and PostCSS.
Atomic output uses `dev: false`, no runtime injection, property-specificity
resolution, the `x` prefix and no CSS layers. Docs import `@lenso/tokens/theme.css`;
adding the package's compiled atomic stylesheet would duplicate the union.

The local Inter variable font is declared in CSS because Next's Babel backend
cannot use `next/font/local`. Its OFL notice remains alongside the font.
The narrow Fumadocs ESM helper exception is documented in
[FUMADOCS-INTEGRATION.md](FUMADOCS-INTEGRATION.md).

## Run against a current export

Use the workspace's Node 26.10 and pnpm 12.9 toolchain:

```sh
pnpm --filter @lenso/ui-docs build
pnpm --filter @lenso/ui-docs start
# In another terminal:
pnpm --filter @lenso/ui-docs test:stylex-build
```

`LENSO_DOCS_TEST_URL` selects the server. `LENSO_STYLEX_EVIDENCE` selects the
artifact directory relative to the docs working directory.

This regression checks actual CSS delivery, not just emitted declarations:

- Direct JavaScript-disabled loads, server API tables, overflow and font loading.
- Library rule/keyframe preservation and absence of duplicate atomic output.
- Shorthand/longhand composition and final caller overrides.
- Spinner animation, both themes, logical corners, RTL and portalled scopes.
- One font preload and the served variable-font asset.

Cold and unchanged warm production runs can expose extraction/cache differences.
Their reports belong in ignored test artifacts, not frozen source snapshots.

## Development limitation

StyleX PostCSS 0.19.1 can retain stale rules when the last StyleX declaration and
import are removed from an existing file. Restart development for a fresh
processing pass; if necessary, stop Next before clearing its generated dev cache.
There is no custom collector or invalidation hook. This regression does not
certify Turbopack or every development invalidation path.
