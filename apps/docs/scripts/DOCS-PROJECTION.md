# Authored documentation projection

`docs-projection.mjs` owns public documentation placement. It combines handwritten
`content/lenso/{en,cn}/react` guides, current public component exports, generated
native TypeScript API and canonical local runnable modules.

Preparation verifies the immutable archive before localizing and registering
examples, extracting the current API, writing the authored index, and producing
the shared contract. It fails on missing scenarios, stale native inventories,
noncanonical paths and canonical-name collisions.

## Public and private data

`src/generated/lenso-docs-index.json` uses format 1:

```text
{ formatVersion, lensoVersion, sourceFamilyMapping,
  pages: [{ locale, slug, title, description, markdownFile,
            examples: [{ name, file }] }] }
```

Rendering, root section navigation, page navigation, search, sitemap, copied
Markdown and maintained example-proof planning consume that index. The active
release comes from `packages/react/package.json`.

The explicit source-family map collapses historical `dropdown` into public
`menu`. `canonicalExampleName` also makes scenario IDs public `menu-*` names.
Raw source references remain in private `live-source-provenance.json` and
localization evidence; there is no runtime Dropdown alias.

The preserved `content/docs`, `content/examples` and `source-index.json` are
hash-protected reference inputs. Their release and migration pages never enter
the authored index.

## Generated output

Component MDX and `src/generated/lenso-contract.json` are ignored build outputs.
Handwritten guides and the generator are reviewed sources. Source links for
generated component pages point at the authoritative projection module.

`generate-lenso-contract.mjs` supplies exact authored Markdown, the current API,
actual demo entry bytes and ordered relative helpers, actual component style-map
source, active package versions and the build package's `buildSupport`.

The shared contract core owns format 2's lossless Markdown-line and source-file
pools. The producer resolves every document, example/helper graph and style map
and compares the resulting DTOs with its original inputs before writing output.
It does not maintain another API formatter or extract component types itself.

The same `localExampleFiles` resolver serves the source pane and contract
producer. It follows static imports, re-exports, type-only relative imports and
literal dynamic imports, including `.js` references to TypeScript source.
Missing helpers, nonliteral dynamic imports and paths escaping the demo root,
including symlinks, fail rather than substitute archived snippets.

## Evidence boundaries

The maintained full source inventory contains 682 references per locale.
Canonical public placements retain all of them, including the Chip palette
formerly placed on an archived release page. Registration is not browser parity
or accessibility certification.

Current native extraction yields 84 families; 72 have dedicated source
scenarios. Twelve supporting families have API documentation but no standalone
scenario. Pages and coverage report that limitation explicitly.

`authored-docs.browser.mjs` proves core/tool guides, Menu, navigation, search,
sitemap and exact copied Markdown in both locales, both themes and desktop/mobile
viewports. `authored-geometry.browser.mjs` records real native-control geometry
before and after the reviewed docs styles. Neither replaces the complete
maintained example matrix.

`validate-docs-projection.mjs` constructs an ignored current-source mirror from
explicit owner inputs and third-party-only dependencies. It records input hashes,
applies only the reviewed header interface, canonical moves and legal file list,
and generates fresh output. Provider workspace packages and stale generated API
are not source authority.
