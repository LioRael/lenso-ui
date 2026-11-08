# Authored documentation projection

`docs-projection.ts` owns public documentation placement. It combines handwritten
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
release comes from `packages/ui/package.json`.

`content/example-catalog.json` is the maintained inventory of local example
names, paths and component placements. The live registry, projection and browser
proofs use this catalog. Historical page/example mirrors and their import index
are retired; retained adaptation provenance is recorded in `THIRD_PARTY_NOTICES.md`.
The source-family map
keeps old names canonical where they are explicitly supplied; there is no runtime
Dropdown alias.

## Generated output

Component MDX and `src/generated/lenso-contract.json` are ignored build outputs.
Handwritten guides and the generator are reviewed sources. Source links for
generated component pages point at the authoritative projection module.

`generate-lenso-contract.ts` supplies exact authored Markdown, the current API,
actual demo entry bytes and ordered relative helpers, actual component style-map
source, active package versions and the workspace's installed upstream StyleX and framework versions.

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

The catalog supplies canonical public placements, including the Chip palette
formerly placed on an archived release page. Registration is not browser parity
or accessibility certification.

Some supporting families have API documentation but no standalone scenario.
Pages and coverage report that limitation explicitly.

`test/browser/authored-docs.test.ts` checks core/tool guides, Menu, navigation,
search, sitemap and exact copied Markdown in English desktop light and Chinese
mobile dark. This does not replace the complete maintained example matrix.

The former migration mirror validator and automatic Chinese-source projection
are retired. Current sources and ordinary generation are the authority; browser
proof remains separate from generated registration and historical provenance.
