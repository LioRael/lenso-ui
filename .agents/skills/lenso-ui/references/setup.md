# Consumer setup

Use the matching installed CLI's help as the command source. `init` produces a
dry-run plan by default; review its proposed changes, conflicts and manual theme
entry steps before opting into `--write`. It neither installs packages nor runs
scripts. Keep complex user-owned configs and integrate the proposed helper
manually when the CLI refuses them.

Read the queried contract's compatibility descriptor for exact UI, tokens,
StyleX runtime and build-adapter versions. Preserve metadata seeding and one
StyleX processing pass. Import theme CSS from each rendering application entry
or root layout, not from an unrelated sibling route.

For Next `16.3.8` App Router Webpack production/non-watch builds, use the named
`prepareNext` export from `@lenso/stylex-build` in an async `webpack` callback:
create one module-level `const prepared = prepareNext(options)`, push
`await prepared` into `config.plugins` in each compiler callback and return
`config`. Reuse that one plugin to avoid repeated union processing and competing
writes. Set `config.cache = false` so cached transforms cannot bypass raw-tuple
coverage checks. This configuration is production-only.
Supply package `metadata`, the complete actual app JS/TS `sources` (including
server-only declarations and error styles), and one `cssFile`; all accept
absolute paths or file URLs. Preserve `unstable_moduleResolution` and any
`lightningcssOptions`. The helper processes raw package/app tuples once into an
ordinary marked CSS file before Next's CSS pipeline. Its coverage guard rejects
omitted/stale declarations; atomic idempotent writes reject authored output.

Every HTML owner imports the same generated CSS and `@lenso/tokens/styles.css`
and supplies its own html/body/theme: each root layout, custom global error and
custom global not-found. A global error is a Client Component replacing the root
layout; layout imports cannot establish its delivery. Completion requires a
served production check, including an actual cold root-layout failure, not just
CLI recognition or emitted CSS. Use the package README for the configuration
example. Watch/HMR, newer Next versions and other bundlers are unproved.

The descriptor's `next.customGlobalError = "explicit-css"` applies to
`next.explicitCss = { api: "prepareNext", mode: "production", watch: false, cache: false }`.
`next.legacyAssetRewrite = { customGlobalError: "unsupported", version: "16.3.8" }`
describes the retained `stylex.webpack` compatibility/development fallback.
CLI `init` still emits that legacy setup to preserve existing dev flows; keep
Next's built-in global error there. CLI `check` recognizes direct `prepareNext`
configuration but does not certify CSS ownership. The public helper's production
proof does not establish watch support. The docs app already uses the official
Babel/PostCSS source union and ordinary imports; it needs no helper migration.
