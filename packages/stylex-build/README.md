# @lenso/stylex-build

Build-only tooling for composing precompiled Lenso StyleX maps with application
styles. Version `0.1.0` is the initial public release. It does not change component
props, render composition, runtime custom properties or native interaction.

**Next.js support is limited to the pinned `16.3.8` App Router Webpack
integrations described below. `prepareNext` supports explicit CSS ownership in
production, non-watch builds, including custom global errors.** This is not a
general Next.js, Pages Router, Rspack or Turbopack adapter.

## Installed consumers

Pin `@lenso/stylex-build` to `0.1.0` in **devDependencies** and
`@stylexjs/stylex` to `0.19.1` in dependencies. Use this adapter instead of a
second `@stylexjs/unplugin` instance. Continue importing
`@lenso/tokens/styles.css` for themes, prose and standalone component CSS.

Build-time consumers can import the JSON-serializable named `buildSupport`
export for the tested Node, StyleX, Next App Router Webpack and Vite contract.
Its compiler metadata and exact Next guard use the same underlying values.
It is a support descriptor, not a promise of untested bundlers or versions.

```ts
import stylex from "@lenso/stylex-build";

const options = {
  metadata: [import.meta.resolve("@lenso/tokens/stylex-rules.json")],
  unstable_moduleResolution: {
    type: "commonJS" as const,
    rootDir: import.meta.dirname,
  },
};

// Vite / Storybook
const vitePlugins = [stylex.vite(options)];
// tsdown / Rolldown
const rolldownPlugins = [stylex.rolldown(options)];
// Legacy Next.js 16.3.8 compatibility/development fallback; see limits below
config.plugins.push(stylex.webpack(options));
```

Disable Webpack transformed-module caching: cached output does not retain
Babel's raw metadata. Vite/Rolldown cached modules are explicitly reprocessed
for each build.

For server-only application declarations absent from the client graph, pass
`sources: [new URL("./src/styles/server.stylex.ts", import.meta.url)]`.
The same compiler collects these actual source files before CSS emission; it
does not treat imported snippets as demos or share a global server/client cache.
Next's named server compilations may have no CSS assets; client emission
includes those explicit sources. `sources` supplies declarations, not a
stylesheet link or evidence that a particular route loads CSS.

`metadata` accepts absolute file paths or file URLs (objects or strings), one per precompiled style
package. The adapter fails before compilation if an artifact is missing,
malformed, has a changed digest, or uses an incompatible format/compiler/mode.
Rebuild the package and application together rather than silently falling back
to independently ranked CSS.

## Production CSS delivery

Every document executing compiled StyleX must load the **complete package and
application union before using those classes**. An emitted file alone does not
meet this contract. The adapters use the bundler's HTML or initial chunk graph,
rather than appending the union to the first CSS asset.

### Vite HTML builds

The production hook runs after Vite emits its HTML graph. By default it emits
one `stylex.css` asset using the configured asset naming/hash pattern and adds
a stylesheet link to every emitted HTML document. This includes multi-page
builds and `sourceOnly` builds without any ordinary CSS import.

The link respects the resolved Vite `base`, including relative bases and
nested HTML paths. Ordinary theme, page and lazy CSS assets stay unchanged;
they do not each receive another copy of the union. Development still uses
the stylesheet update script; production does not inject a JavaScript CSS
loader.

### Generic Webpack consumers

Every client entry must reach an initial CSS asset through its entrypoint and
initial chunk graph. Import the theme stylesheet from that graph, and make
the document load its initial CSS before the entry JavaScript. An unrelated
emitted CSS file or a stylesheet reachable only through a lazy chunk does not
satisfy the requirement. Missing delivery fails the build.

The adapter appends the same union to every selected initial CSS asset, once
per physical asset. This can duplicate the union across separate entries.
Mutation happens before native final CSS content hashing. Async CSS assets
are not modified: the complete union is already available from the entry's
initial stylesheets.

### Next.js explicit production CSS

For Next `16.3.8` App Router production builds, use the named `prepareNext`
export. It generates one marked, ordinary physical CSS file **before Next's CSS
pipeline** processes imports. Package metadata and the complete application raw
rule tuples are processed together once; processed stylesheets are not
concatenated. The public path does not use `ClientReferenceManifestPlugin`,
`next/dist` imports or manifest regex rewriting.

```js
// next.config.mjs — list every actual application JS/TS source file.
import { prepareNext } from "@lenso/stylex-build";

const prepared = prepareNext({
  metadata: [import.meta.resolve("@lenso/tokens/stylex-rules.json")],
  sources: [
    new URL("./app/layout.tsx", import.meta.url),
    new URL("./app/page.tsx", import.meta.url),
    new URL("./app/global-error.tsx", import.meta.url),
    new URL("./src/styles/server.stylex.ts", import.meta.url),
  ],
  cssFile: new URL("./app/lenso.generated.css", import.meta.url),
  unstable_moduleResolution: {
    type: "commonJS",
    rootDir: import.meta.dirname,
  },
});

export default {
  async webpack(config) {
    config.cache = false;
    config.plugins.push(await prepared);
    return config;
  },
};
```

This configuration is for production builds only. Reuse one preparation promise
and plugin across Next's compiler callbacks to avoid repeated union processing
and competing output writes. Disable Webpack caching so cached transforms cannot
bypass raw-tuple coverage checks.

`metadata`, `sources` and `cssFile` accept absolute paths or file URLs.
`lightningcssOptions` configures the final CSS processing. The source list above
is a small application's example, not a discovery rule: include the complete
actual app JS/TS files, including server-only declarations and error styles.
External discovery can use Node 26 `fs.glob`; keep the inventory complete as
files change. A raw-tuple coverage guard rejects omitted or stale declarations.
Generated writes are atomic and idempotent; an authored file at `cssFile` is
rejected rather than overwritten.

Every HTML owner must explicitly import **the same generated file** and
`@lenso/tokens/styles.css`: each root layout, custom `global-error` and custom
`global-not-found`. Each owner supplies its own `<html>`, `<body>` and theme.
A global error is a Client Component that replaces the root layout, so it
cannot rely on the layout's imports:

```tsx
"use client";

import "./lenso.generated.css";
import "@lenso/tokens/styles.css";

export default function GlobalError() {
  return (
    <html lang="en">
      <body className="light">Something went wrong.</body>
    </html>
  );
}
```

Run `next build --webpack` and exercise the served production documents,
including a cold root-layout failure. `prepareNext` is production/non-watch
only; `next dev`, HMR and newer Next versions are not verified support.
The maintained production/browser fixture covers actual cold root failure.
The documentation app already uses the official Babel/PostCSS source union
and ordinary CSS imports; it does not need migration to this helper.

### Legacy pinned Next.js asset rewrite

`stylex.webpack` retains the pinned `16.3.8` automatic asset rewrite as a
compatibility/development fallback. It is not the new production default:
the public helper has production delivery proof, while watch behavior remains
unproved. CLI `init` continues to generate this legacy setup to preserve
existing development flows. CLI `check` recognizes direct `prepareNext`
configuration but does not certify CSS ownership.

The support descriptor records `next.customGlobalError = "explicit-css"`,
`next.explicitCss = { api: "prepareNext", mode: "production", watch: false, cache: false }`
and `next.legacyAssetRewrite = { customGlobalError: "unsupported", version: "16.3.8" }`.

Next `16.3.8` deduplicates CSS into layout/template entries and merges their
inventories into client-reference manifests. A page chunk without CSS is
therefore not necessarily unstyled; conversely, CSS listed in its manifest
can belong to a sibling route group that the page never renders.

The adapter retains owner-to-CSS associations and accepts only the physical
page's own CSS and its ancestor layout/template CSS as delivery evidence.
Import the theme from the actual rendering layout for **each root layout
tree**. A stylesheet imported only by a sibling root layout does not count.
Optional slot, loading or error stylesheet inventories are not used to prove
that the page loads the union.

CSS mutation precedes native hashing and inline-CSS capture. Validation runs
after Next emits the native manifests and checks the resulting union-bearing
assets; inline CSS must match the final asset contents. The integration guards
the exact Next version and manifest schema, including native `%5F` route-key
normalization while retaining physical source paths for owner selection.
Other versions or unsupported graphs fail closed.

Server-only StyleX and precompiled maps still require a reachable stylesheet.
A CSS-less custom rendering route fails even if its client graph contains no
StyleX: that absence cannot prove what its server component renders.

The only CSS-less fallback exemptions are the pinned framework's known
not-found and static-500 entries with positive native module/loader ownership
evidence. They are not generic exemptions for entries with no CSS or missing
source files.

Next maps `app/global-not-found.*` to a synthetic not-found entry. A custom
server fallback must import its own ordinary stylesheet; an unrelated layout
theme does not style it. The package's proof covers both rejection without CSS
and styled production rendering after that fallback imports CSS.

**The legacy adapter rejects custom `app/global-error.*`, even when another
route imports a theme.** Retain Next's built-in global error component with
this fallback, or use the explicit production CSS contract above.

The proofs use default App Router conventions and a configured extension list
that retains the standard JS/TS families. They do not establish support for
arbitrary `pageExtensions`: the pinned Next build rejected multi-part
`page.page.jsx` and restrictive `["jsx"]` fixtures during native
`private-next-app-dir` resolution, before this adapter could prove delivery.

### Non-HTML and package builds

Rolldown and Vite library/non-HTML builds do not provide a document-linking
contract. The adapter appends the union to all ordinary CSS assets, or emits
`assets/stylex.css` when no CSS asset exists. The caller must import or link
the resulting stylesheet in **every consuming document**. A standalone file
is deliberate package output, not an automatically loaded browser demo.

### Explicit `cssInjectionTarget`

`cssInjectionTarget: (fileName) => boolean` constrains selection; it never
falls back to another CSS asset when the predicate matches nothing.

- For Vite HTML builds, every document must already link a matching
  stylesheet. The adapter validates emitted stylesheet links against the
  resolved base and relative document path before modifying assets. It
  does not add a second automatic union link in this mode.
- For generic Webpack, every entry must reach a matching initial CSS asset.
  For pinned Next, the matching union-bearing asset must belong to the
  page or a rendering ancestor layout/template, not a sibling inventory.
- Non-HTML builds require at least one match, but reachability remains the
  caller's external stylesheet-loading contract.

The predicate sees filenames before union insertion; native final hashes can
change afterward. Do not hard-code a content hash as a stable target. HTML
rewrites or custom asset-URL conventions that cannot satisfy the emitted-link
check are rejected rather than assumed reachable.

## Package producers

```ts
plugins: [
  stylex.rolldown({
    emitMetadata: "stylex-rules.json",
    devMode: "off",
  }),
];
```

Publish the JSON beside the compiled maps and deliberately export it from
`package.json`. Contract v1 contains the original Babel raw-rule tuples,
`@stylexjs/babel-plugin` version `0.19.1`, a SHA-256 digest, and the fixed
compile mode: production property-specificity keys, prefix `x`, no runtime
injection. The artifact is build input, not a mutable runtime registry.
Consumers must not parse or import it into browser code.

`sourceOnly: true` is for builds compiling all their style declarations from
source, with no precompiled style input. It is not a consumer fallback.
The React package uses it because its production source composes imported
compiled maps without declaring additional styles.

## Processing and costs

The public upstream raw factory still performs Babel compilation. Babel's
public `post` hook collects its complete `metadata.stylex` tuples into a
build-local collection. Every emission combines package and application rules
and invokes the public `processStylexRules` once, followed by Lightning CSS.
There is no replacement specificity, sorting, RTL or deduplication algorithm.
Layers and legacy compiler flags are not configurable.

The collector does not use upstream's process-global store or disk cache.
Collection ownership uses the full bundler module ID, including query
variants, independently of Babel's normalized filename. A `?raw` reference
cannot erase rules from the actual styled module. Retransformation replaces
only that module's rules; physical-file deletion removes its variants.
Vite, Rolldown and Webpack only adapt emission and development stylesheet
delivery around that shared collector. The emission hooks and Vite update
timing are adapted from MIT-licensed `@stylexjs/unplugin` `0.19.0`; upstream
copyright is retained in `src/adapters.mjs` and `LICENSE`.

The default Lightning CSS exclusion preserves native `:dir()` selectors.
The package's existing guarded CSS may remain loaded: the union contains every
package rule and assigns its bucket ranks from the complete set. Regression
proofs check late package CSS as well as reverse stylesheet order, including
conditional sub-bucket priorities. Do not substitute CSS insertion ordering
for metadata composition.

The artifact increases package bytes and build-time collection/processing work.
Combined consumer CSS includes the package's complete rule inventory rather
than per-component tree-shaken CSS. Existing standalone package CSS and
separate Webpack initial assets can duplicate those bytes. No compiler,
metadata loader or tooling code enters
the production browser JavaScript graph. Development only loads the adapter's
stylesheet update script; production emits CSS.

This package supports the pinned compiler generation, not arbitrary StyleX
versions. Changing the compiler, compiled key mode or artifact format requires
a new compatibility decision and rebuilding both sides.

## Bounded verification

From the repository root, with its pinned Node and installed test dependencies:

```sh
node --test packages/stylex-build/tests/*.test.mjs

# A fresh ignored evidence directory and a separate read-only dependency checkout:
node packages/stylex-build/tests/production-delivery.mjs \
  test-results/stylex-delivery <dependency-checkout>

# Small maintained Next production + browser fixture:
pnpm --filter @lenso/stylex-build test:next
```

The production fixture packs current tooling, extracts the consumed package,
copies the lockfile and uses read-only provider dependencies. It is not a
clean-registry installation or a publication. Chromium checks real Vite
multi-page/base/relative/source-only builds, query variants, lazy CSS and
actual MiniCssExtractPlugin Webpack multi-entry consumers.

The maintained Next fixture checks explicit production CSS delivery, including
server-only declarations and cold root-layout failure with a custom global
error. The older `next-delivery.mjs` runner is retired. These small fixtures do
not establish that the documentation app's default SSG build passed, or prove
watch/HMR behavior. The priority regression separately checks late package CSS
and reverse stylesheet order.
