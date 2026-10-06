# Authored documentation projection

`docs-projection.mjs` owns public documentation placement. It combines handwritten
`content/lenso/{en,cn}/react` guides, current public component exports, generated
native TypeScript API and canonical local runnable modules.

`generate-docs.ts` incrementally registers maintained local examples, extracts
the current API, writes the authored index and produces the shared contract.
It fails on missing scenarios, stale native inventories, noncanonical paths and
canonical-name collisions. It never rewrites example sources. Upstream import
and source capture are separate explicit operations.

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
Raw source references remain in the imported `content/source-index.json`;
there is no runtime Dropdown alias.

The preserved `content/docs`, `content/examples` and `source-index.json` retain
import-time hashes as provenance, not normal-build gates. Their release and
migration pages never enter the authored index.

## Generated output

Component MDX and `src/generated/lenso-contract.json` are ignored build outputs.
Handwritten guides and the generator are reviewed sources. Source links for
generated component pages point at the authoritative projection module.

`generate-lenso-contract.ts` supplies exact authored Markdown, the current API,
actual demo entry bytes and ordered relative helpers, actual component style-map
source, active package versions and the build package's `buildSupport`.

The typed shared contract core owns format 3's lossless Markdown-line and source-file
pools, including actual library implementation graphs and theme CSS declarations.
The producer resolves every document, example/helper graph and style map
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

The former migration mirror validator and automatic Chinese-source projection
are retired. Current sources and ordinary generation are the authority; browser
proof remains separate from generated registration and historical provenance.
