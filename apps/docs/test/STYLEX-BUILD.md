# Docs StyleX source-union build

The docs app follows the [official Next.js Babel + PostCSS integration](https://stylexjs.com/docs/learn/installation/nextjs/).
This is a **monorepo source-union configuration**, not a recipe for external
consumers of precompiled packages.

`babel.config.json` supplies the compiler plugin options to both Next's Babel
loader and `postcss.config.cjs`. Next 16.3.8's Webpack Babel loader rejects
`.cjs`/`.mjs` Babel configuration files; JSON also works in this ESM package.
Both sides compile with `dev: false`, `runtimeInjection: false`,
`styleResolution: "property-specificity"` and `classNamePrefix: "x"`.
PostCSS disables CSS layers for atomic output.

The one `@stylex` entry scans `apps/docs/src` and canonical
`packages/styles/src` together, including server-only declarations. There is
no metadata seed, additional extraction hook, explicit server-source list,
StyleX Webpack callback or disabled Webpack cache.

The Fumadocs 16.9 integration adds a separate, narrow Next/Babel compatibility
exception in `next.config.ts`: only its precompiled `remove-markdown-*.js` ESM
helper bypasses Babel. Next 16.3.8's `plugins/commonjs.js` mistakes the helper's
locally bound `module.exports` callback for a CommonJS module and rewrites its
exports; the public search hook imports that helper through an unused backend.
Fuma is not in `transpilePackages`. Babel `ignore` was tested, but Next's cached
`getFreshConfig` uses placeholder filenames and does not forward that option.
The exception neither changes StyleX extraction nor disables Webpack caching.
See `FUMADOCS-INTEGRATION.md` for current integration evidence; the measurements
below remain the earlier StyleX-only run, not evidence for the newer shell.

## Theme and font delivery

`@lenso/tokens/theme.css` is an unchanged copy of the package's source
`styles.css`: theme and base imports, without the separately compiled atomic
asset. The existing `@lenso/tokens/styles.css` export still includes that asset.
The raw-rule artifact and shared Vite/Rolldown build integration are unchanged.
Docs import only `theme.css` through their global CSS entry; importing the old
atomic stylesheet alongside the union would create a second processing result.

Next's Webpack Babel loader disables SWC, so `next/font/local` fails with
`babel-font-loader-conflict`. The docs now declare the **same local Inter
variable asset**, not a substitute or a download, in `global.css`. Weight
`100 900`, normal style, swap display, `--font-inter` and preloading remain.
Arial fallback overrides reproduce Next 16.3.8's fontkit calculations:
ascent `89.79%`, descent `22.36%`, line gap `0%`, size adjust `107.89%`.
React DOM's `preload` emits one resource hint rather than duplicate explicit
head links.

Font SHA-256:
`29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031`.
The existing `public/fonts/Inter-Variable-OFL.txt` and provenance JSON are
unchanged; redistribution remains SIL OFL 1.1.

## Reproduce the focused production proof

Use Node 24.18.0 and the frozen workspace lockfile. Build the style and React
packages first, then run the docs build:

```sh
pnpm --filter @lenso/tokens build
pnpm --filter @lenso/ui build
pnpm --filter @lenso/ui-docs build
```

Serve the export with `pnpm --filter @lenso/ui-docs start`. In another terminal:

```sh
pnpm --filter @lenso/ui-docs test:stylex-build
```

`LENSO_DOCS_TEST_URL` selects the server. `LENSO_STYLEX_EVIDENCE` selects the
results directory relative to the docs working directory. Run the same proof
after a cold build (remove only generated `apps/docs/.next`) and an unchanged
warm build. Compare the resulting `results.json` files.

The proof checks:

- First direct loads with JavaScript disabled: EN Button, CN Date Picker and
  unprefixed Button routes, server-rendered native API tables, prose cell/header
  geometry, scroll overflow and font delivery.
- Exact compiled Button and Spinner maps, every nonempty library rule identity,
  keyframe names, native `:dir(rtl)`, and one atomic stylesheet without duplicate
  atomic rule fingerprints or keyframe definitions.
- Computed shorthand/longhand union composition in both orders, final caller
  longhand overrides, and Spinner's actual animation name.
- Light/dark logical corners and RTL breadcrumb rotation in native and
  body-mounted scopes; the real native search dialog portal inherits both
  themes and English-language RTL.
- The served Inter bytes, one font preload and a loaded variable font.

## Recorded production evidence

Baseline: `9fb31180e115591381ee733eb880ede8ec51fb0a`, with the incoming docs/CLI
edits retained. These results do not certify later parallel component changes.

Tested: Node **24.18.0**, Next **16.3.8**, StyleX Babel/PostCSS **0.19.1**,
**Webpack**, static export. Official documentation supports both Next bundlers;
Turbopack was not tested here.

Cold compile: **50 seconds**. Warm compile: **9.5 seconds** with Webpack
filesystem cache enabled and populated. Both generated 309 static pages and
passed the focused proof; their full production `results.json` values matched.

- Source union: 1,656 JS/TS files.
- Union source SHA-256:
  `2e07c663478ab6b9a2538602ff86c2ce27a81853f23b77b5623d305bd7c76e2e`.
- Delivered atomic file: `a6797782bcae0ed4.css`.
- Atomic SHA-256:
  `c6ece864686ccc36bd63a92e05fb7435d7b0ffa400066fa924335bede529e443`.
- 1,921 minified atomic rules; 1,197 nonempty library identities preserved.
  The 128 `defineConsts` records with empty CSS are not selectors.
- 17 compiled StyleX keyframes plus existing theme keyframes `spin`,
  `skeleton`, `caret-blink`; no duplicate definitions.
- Exact Spinner animation name: `x1fy8ia8-B`.
- Server tables: 14px font, 24px line height, 10px cells, 3px code padding,
  `border-collapse: separate` and `overflow: auto`.
- Union padding: `[0, 10, 0, 10]` in either shorthand/longhand order;
  existing library inline longhand remains `[0, 16, 0, 16]`; final app
  longhand override becomes `[14, 24, 14, 24]`.

Raw local evidence is under `test-results/stylex-postcss-{cold,warm}/results.json`,
with build/proof logs alongside those directories.

The dependency change is docs-local: remove the docs dependency on
`@lenso/stylex-build`; add exact `@stylexjs/babel-plugin@0.19.1` and
`@stylexjs/postcss-plugin@0.19.1`. The lockfile adds 162 lines and removes 3,
introducing 20 package entries: PostCSS's plugin and 19 glob-discovery
dependencies. Babel 0.19.1 was already locked transitively and is now a direct
docs build dependency. Existing versions and shared build-package consumers
are unchanged.

## Development limits in plugin 0.19.1

The standalone persistent-builder probe confirms that direct edits replace
rules, imported `defineConsts` value edits update CSS for unchanged consumers,
and deleting a file removes its rules when PostCSS reruns. **Removing the last
StyleX declaration/import from an existing file retains its previous rules.**

A bounded real Next Webpack dev/HMR exercise on a disposable source confirmed:

1. A new fixture present at startup emitted `width: 1930px`.
2. Editing it to `1970px` updated the live browser and removed `1930px`.
3. Removing the final declaration and import left `1970px` in the live CSS
   after recompilation.
4. Deleting the file removed that CSS from the live browser.

The fixture was deleted afterward. Logs and timestamped observations are in
`test-results/stylex-postcss-dev-hmr.json`, `stylex-postcss-dev-removal.json`
and `stylex-postcss-dev.log`. These are Webpack results only. Addition during
an already running session and invalidation of other dependency forms were not
certified.

For last-declaration removal, restart development with a fresh PostCSS
processing pass; if cached CSS remains, stop Next and remove its generated
`.next/dev` cache before restarting. No custom collector or invalidation hook
is installed. The dev exercise also logged a local `ENOSPC` cache-pack write;
only this worktree's generated dev output was removed afterward. Cold/warm
production builds and proofs completed before that disk-space warning.

Scoped oxlint and oxfmt checks passed. A changed-scope React Doctor invocation
timed out before producing a result; no React Doctor score is claimed.
