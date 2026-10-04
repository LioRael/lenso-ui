# Lenso product identity, tooling and redistribution

Research date: **2026-10-02 UTC**. Scope: independent Lenso documentation and
versioning, the public `Dropdown` → `Menu` rename, less public upstream
attribution, and HeroUI-informed MCP, skills and CLI. This is a recommendation,
not an implementation or legal opinion.

Read `AGENTS.md` and `DESIGN.md`. Audited the attached authoritative checkout
at HEAD `d9aba485aa43b207f0808f9ba62ef7ead39584bb`, including current untracked
source files. Did not follow dependency symlinks into the physical provider
workspace. Only public docs, source archives and npm artifacts were fetched;
no package was installed or executed, and no private code was uploaded.

## Recommendation

Make Lenso the public product, with its own release version, local source
links, native API documentation and installation instructions. Retain
HeroUI v3.2.6 and commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e` as **historical provenance**, not a
second public product version or compatibility promise.

Build **one versioned Lenso metadata/contracts artifact**, consumed by docs,
MCP, skill helpers and CLI. Reuse the local TypeScript API extraction and
demo evidence rather than introducing three independent component catalogs.
HeroUI is a useful tooling reference, but its API, Tailwind/RAC instructions,
remote service and templates must not become Lenso's authority.

Keep root MIT for now, package-level Apache-2.0 for HeroUI-derived UI/theme
work, MIT for preserved primitives, and MIT with upstream attribution for
`@lenso/stylex-build`. Decide repository-wide licensing explicitly before
changing root `LICENSE`; product independence does not remove derivation.

## What HeroUI actually publishes today

The table records npm `latest` and publication timestamps queried on the
research date, not the version of every moving documentation page. Registry
metadata and tarballs are separate evidence. [1–4]

| Artifact            | Latest  | Published UTC       | Runtime/license evidence                                                                   |
| ------------------- | ------- | ------------------- | ------------------------------------------------------------------------------------------ |
| `heroui-cli`        | `3.0.5` | 2026-09-26 11:42:43 | `node >=22.22.0`, `pnpm >=12.x`; MIT metadata and `package/license`; `heroui` executable   |
| `@heroui/react-mcp` | `1.1.2` | 2026-09-04 20:54:31 | `node >=22.0.0`; MIT metadata and `package/LICENSE`; `heroui-react-mcp` executable         |
| `@heroui/react`     | `3.2.6` | 2026-09-17 19:13:54 | Metadata says MIT, but shipped `package/LICENSE` is Apache-2.0, Copyright 2025 NextUI Inc. |
| `@heroui/styles`    | `3.2.6` | 2026-09-17 19:11:56 | Same metadata/license-file discrepancy as React                                            |

Do not infer an upstream relicensing from npm's MIT field. The pinned source
license and actual UI/styles distribution licenses support the existing
Apache-2.0 treatment. Resolve the discrepancy with upstream before relying on
different terms. Tooling has different licenses from UI source. [1–4, 10]

### MCP: local stdio, remote retrieval

Official docs explicitly scope MCP to **React v3 and stdio**. They show
configuration for Cursor, Claude Code, Windsurf, Zed, VS Code/Copilot, Codex
and OpenCode. These are documented integrations, not a verified OS support
matrix. There is no documented React Native MCP or HTTP transport in this
React package. [5]

The published `1.1.2` `dist/stdio.js` uses the MCP SDK
`StdioServerTransport` and registers six tools:

- `list_components`
- `get_component_docs`
- `get_component_source_code`
- `get_component_source_styles`
- `get_theme_variables`
- `get_docs`

It retrieves data over HTTPS from `https://mcp-api.heroui.com`, including
`/v1/ctx`, `/v1/components`, `/v1/components/docs`, `/v1/components/source`,
`/v1/components/styles`, `/v1/themes/variables` and `/v1/docs/...`.
`HEROUI_API_URL` overrides the endpoint; `HEROUI_API_KEY` is read by the
request helper. Therefore “local MCP” does **not** mean offline or
local-only data. Component names and guide paths go to the service; no
workspace upload or package-install tool was found in these registered
handlers. Service-side logging/retention was not established by this audit.
Do not confuse MCP transport framing with this internal HTTP API. [2, 5]

The docs' “automatic updates” section describes what an **assistant** can do
using retrieved knowledge. There is no registered upgrade or filesystem
mutation tool in the package. Do not advertise an equivalent Lenso feature
until the assistant workflow and its permissions are proven. [2, 5]

### Skills: instructions plus executable fetch helpers

The official React skill includes `SKILL.md`, Apache-2.0 `LICENSE.txt` and
six `.mjs` helpers for listing components and fetching docs/source/styles/
theme/guides. Installation is offered through
`curl -fsSL https://heroui.com/install | bash -s heroui-react` or
`npx skills add heroui-inc/heroui`; the docs mention Claude Code, Cursor,
OpenCode and other compatible agents. Skills are discovered by the agent or
invoked as `/heroui-react`; this is not an MCP protocol implementation. [6, 7]

The inspected list helper calls `mcp-api.heroui.com/v1/components`, appends
`app=react-skills`, identifies a `HeroUI-Skill/1.0` user agent, supports
`HEROUI_API_BASE`, uses a 30-second timeout and falls back to
`https://heroui.com/react/llms.txt`. This is live network knowledge, not a
version-pinned offline catalog. The skill explicitly teaches Tailwind v4
and `onPress`; copying it unchanged would contradict Lenso's StyleX/native
Base UI boundary. [7]

### CLI: current v3 dependency manager, not the old add-component model

Current docs and `3.0.5` source expose `init`, `install`, `upgrade`,
`uninstall`, `list`, `env`, `doctor`, and `agents-md`. Help explicitly
describes installing/upgrading/removing **`@heroui/react` and
`@heroui/styles`**. The introductory sentence about “individual components”
is not sufficient evidence for an old `add`-style registry CLI. [1, 8, 9]

`init` offers Next.js App/Pages, Vite and React Router templates. Published
code downloads GitHub codeload template archives and invokes package-manager
commands. `agents-md` supports React/Native/migration selections, target
output files and SSH; it downloads documentation into the project.
React Native knowledge in this command does not expand the React MCP's
scope. CLI docs describe anonymous `agents-md` analytics and
`HEROUI_ANALYTICS_DISABLED=1`; the package depends on `posthog-node`.
Do not claim the CLI is network-free or non-mutating. [1, 8, 9]

Global npm/pnpm/yarn/Bun installation and npx/pnpm-dlx/yarn-dlx/bunx execution
are documented. Node requirements are concrete; these invocation examples
are not proof of tested macOS/Linux/Windows support. The shell-pipe skill
installer additionally requires a suitable shell. Lenso should publish an
explicit tested platform matrix rather than inherit an implied one. [5, 6, 8]

### Installation security for a Lenso equivalent

Recommendations, not claims of vulnerabilities in HeroUI:

- Do not make `curl | bash` the default. Show a pinned package/skill revision,
  an inspect-before-run path and the exact files/configuration written.
- Pin tool versions and fetched contracts to the requested Lenso release.
  `npx -y ...@latest` executes newly resolved third-party code; pinning the
  wrapper alone does not pin a mutable remote knowledge backend.
- Start MCP read-only. Reserve stdout for protocol traffic; put diagnostics
  on stderr. Bound retrieval, validate schemas and allowlisted paths, and
  reject arbitrary file/URL reads. Keep API secrets out of repository files.
- Make CLI mutation opt-in with plan/dry-run, explicit overwrite handling,
  argument-safe process execution and validated archive extraction.
  Doctor/list must not quietly install dependencies.
- Prefer bundled/offline contracts. Make remote refresh and telemetry
  separately explicit; document destination, payload and retention policy.
  Retrieved documentation is reference data, not trusted agent instructions.

## Current Lenso state and active leftovers

Local primary evidence:

- `packages/react/package.json` publishes `@lenso/ui@0.8.0` as Apache-2.0;
  `packages/styles/package.json` publishes `@lenso/tokens@0.8.0` as
  Apache-2.0. The **directory** `packages/styles` and **package name**
  `@lenso/tokens` are distinct. `packages/stylex-build/package.json` is
  `0.1.0`, MIT; `apps/docs/package.json` is private `0.1.0`. The docs
  application's package version is not yet an authoritative UI version.
- `apps/docs/src/lib/source.ts`, `content/source-index.json` and
  `content/upstream-manifest.json` retain imported pages/examples/provenance.
  `scripts/generate-live-registry.mjs` and `src/components-registry.ts` are
  an **active local live-demo registry**. It must not be deleted merely
  because DESIGN rejects the old distributable registry/generator system.
- `scripts/generate-api-reference.mjs`,
  `src/generated/api-reference.json`, `src/components/native-api-reference.tsx`
  and `src/lib/native-api-section.ts` already extract local native contracts
  and project API sections into visible and clipboard Markdown.
- `ComponentLinks` still exposes pinned upstream source plus HeroUI
  Storybook/Figma, RAC, Radix and Tailwind destinations. `ViewOptions`
  copies Markdown but its source action opens a pinned upstream page.
  Layout/version labels repeat HeroUI v3.2.6.
- Imported English/Chinese MCP/skills/AGENTS/LLMs and migration pages are
  reference content, **not proof of an implemented Lenso integration**.
  No Lenso MCP server or product CLI package was found in active manifests;
  `.agents/skills/land` is repository operations, not a consumer UI skill.
- Legacy `tooling/registry-builder`, `tooling/token-generator`,
  `packages/ui`, `packages/tokens` and `packages/docs` directories in this
  checkout have empty source directories/dependency symlinks, not package
  manifests or implementation files. `pnpm-workspace.yaml` includes
  `apps/*` and `packages/*`, not `tooling/*`. Treat these as inert
  materialization leftovers, not evidence of a surviving runtime.
  npm publication-script uses of “registry” refer to npm, not a component
  registry.

The checkout has concurrent untracked demo/proof files. This audit does not
certify release cleanliness, successful build or live coverage.

## One Lenso source of truth

Recommended artifact: a versioned public contracts manifest plus linked
content payloads, generated from actual package exports, native API
extraction, authored local docs and existing demo proof. It should contain:

- schema version, Lenso release, package versions, source revision and
  compatibility ranges;
- canonical component ID/name/import/subpath, parts, props, callback state,
  native owner (`Base UI`, context-dependent RAC, or HTML);
- local guide/API/example/style/theme references; locale and version;
- explicit demo status: imported snippet, live implementation, verified
  behavior/geometry, gaps and evidence revision;
- separate provenance: upstream project/tag/SHA/path and applicable license;
- migration mappings and redirects, with no automatic claim of API parity.

TypeScript owns the public signatures; the manifest indexes/generated
projections own discovery. Do not manually duplicate prop schemas in
MCP, CLI or skills. Docs HTML, copied Markdown, LLMs text, MCP tools and
CLI JSON must resolve the same release/component IDs. Skills provide thin
instructions and helpers that read that artifact, not another catalog.
Keep raw imported content separate from public rewritten content and
provenance. A new manifest is not a revival of the discarded DTCG graph.

Recommended delivery order: contracts/docs identity first; read-only
stdio MCP and skill helpers second; CLI `list`, `docs`, `doctor` and
`agents-md` projections third; mutation/templates only after their
installation contracts are agreed. Share retrieval/validation behavior
across adapters rather than treating the HeroUI API as Lenso's backend.

## Public `Menu` rename without falsifying history

Make `Menu` the canonical public family and map to Base UI's native menu
contracts centrally. Inventory root/named exports, package subpaths,
TypeScript declarations, compound parts, style imports, internal component
names, Storybook, live demos, localized docs, navigation/search, generated
API families, clipboard Markdown and downstream imports. Docs layout,
language selector and page actions currently import `Dropdown`.

Use one public mapping record (`Menu`, `menu`, native Base UI menu owner;
historical source family `Dropdown`/`dropdown`) in the contracts manifest.
The native API slug resolver should consume it instead of acquiring another
one-off mapping alongside text-area/text-field. Renaming alone is not proof
that part names or behavior match Base UI; document the actual exports.

Keep raw source archives, manifests, upstream filenames and pinned links
unchanged. Project local authored docs/examples to Menu and redirect old
public URLs where useful. Do not run a global replacement across the source
archive or erase the version pin to make rename tests pass. A codemod or
migration guide must distinguish imported Lenso identifiers/subpaths from
arbitrary user strings and provenance.

Open compatibility decision: release the rename as a breaking change with a
migration guide, or offer a time-bounded deprecated alias. DESIGN currently
rejects compatibility aliases; prefer the breaking rename unless explicitly
overridden. Choose the Lenso version under its own pre-1.0/release policy,
not by copying HeroUI's version.

## Notices: less product attribution, unchanged legal obligations

Apache-2.0 §4 applies to source **and object** redistribution. [11]

| Rule  | Practical policy                                                                                                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| §4(a) | Give recipients the Apache license text; a website link alone is not a substitute.                                                                                                                                       |
| §4(b) | Each modified upstream file needs a prominent statement that it changed.                                                                                                                                                 |
| §4(c) | Distributed source retains applicable upstream copyright, patent, trademark and attribution notices; omit only notices unrelated to the distributed parts.                                                               |
| §4(d) | If the original work includes NOTICE, carry its applicable attribution in a readable NOTICE, distributed source/docs, or the customary display location. Extra attribution may be added but does not modify the license. |

The entire pinned HeroUI source archive was scanned for NOTICE basenames:
**none found**. Both current UI/styles npm tarballs contain Apache
`LICENSE`, and no NOTICE file was found there either. The local
`third-party/heroui/NOTICE.md` is a **Lenso-authored provenance notice**, not
evidence of an upstream NOTICE. Absence of NOTICE does not waive §4(a–c).
Recheck each source and dependency actually copied; this is not a universal
claim about every HeroUI release or all embedded third-party material.
[3, 4, 10]

Current local notice describes “DTCG tokens” and broad replacement of React
Aria, while DESIGN removes the DTCG graph and preserves date/time/color RAC.
Recommend correcting that provenance description in a later approved
notice edit; do not silently remove it or claim all work is clean-room.

### Minimal root and per-file policy

1. Leave root MIT unchanged pending an explicit licensing decision. Add a
   concise root third-party/license-scope document identifying
   HeroUI-derived Apache UI/styles/docs, preserved MIT primitives and
   MIT StyleX build adaptations; point to full texts and pinned provenance.
   Make clear root MIT does not replace third-party terms.
2. Preserve original copyright headers and all applicable embedded notices.
   For a **modified copied/adapted file**, add a short top-level notice,
   alongside rather than instead of existing headers:
   `Modified by Lenso contributors: StyleX styling and native Base UI interaction.`
   Describe the actual change for docs, theme or RAC files instead.
   An existing accurate, prominent “Modified…”/“Adapted… local…” header
   can satisfy the same purpose; avoid duplicating it.
3. New independent files do not need fictitious HeroUI authorship.
   Classify provenance from the actual inputs/history: adapted demos,
   imported docs, copied themes and translated/transformed style source
   remain derived even when interaction code was rewritten.
   Independently written code can carry Lenso's appropriate license, but
   changing the implementation today cannot retroactively make copied
   source clean-room. Document ambiguous cases for review.
4. `packages/stylex-build/LICENSE` already retains Meta's copyright and
   MIT terms; its README identifies adaptation from
   `@stylexjs/unplugin@0.19.0`. Keep those and the copied upstream's exact
   applicable notices. Primitives stay byte-for-byte untouched.

Apache §6 does not grant product branding/trademark rights; descriptive
origin attribution is allowed. Neither §4 nor §6 requires a HeroUI badge,
HeroUI version label, Figma/Storybook button, upstream source button on
every component page, or promotional external links. Those can be removed
or replaced by local links **without deleting legal source notices,
distributed license texts or any required NOTICE content**. A concise
accessible licenses/provenance page is preferable to repeated product
attribution; do not treat that page alone as npm compliance. [11]

### Distribution checks to add later

Concrete failure to prevent: correct repository notices disappear through
package `files` filtering, build cleanup or comment stripping.

- Build then inspect the **actual packed tarballs**, not just manifests:
  `@lenso/ui`, `@lenso/tokens`, stylex-build and any future tool/skill.
  Assert full applicable license text, exact copyright text and notices.
  Current UI build copies HeroUI texts into `dist/HEROUI-*`; styles copy
  `third-party/heroui` into `dist/third-party/heroui`. Both publish `dist`.
  These scripts are intent, not packed-artifact proof.
- Check exported UI JS/declarations, CSS/theme files and shipped StyleX
  source against a provenance inventory. Preserve necessary distribution
  notices even if the compiler strips source comments; keep per-file
  modification notices in source distributions.
- Check source archives include root scope documentation, original
  licenses, adapted-file headers, third-party notices and the immutable
  upstream provenance. Check embedded copied icons/docs assets separately.
- Give independently authored tool packages their chosen license; if CLI
  or MCP MIT source is copied, ship its original copyright/permission
  notice. If Apache skill source is copied, apply Apache obligations to
  that copied material. Do not blanket-license every tool as Apache
  merely because the UI is Apache.
- Add a fixture that intentionally omits/filters a required notice and
  proves the pack check fails. Existing notice-copy code does not prove
  tarball completeness. Also validate license fields against shipped text
  to catch the upstream metadata discrepancy observed above.

## Decisions still needed

- Canonical documentation origin and independent Lenso release/version
  policy; docs app and UI package versions need not be identical.
- Breaking Menu rename versus a temporary exception to the no-alias rule.
- Offline/bundled contracts versus hosted refresh; recommend bundled
  version-specific artifacts first, remote refresh explicit.
- Consumer tooling package names, supported Node/OS/agent matrix and
  whether CLI mutation/templates are in the initial release.
- Root license scope statement and licenses for newly authored tooling;
  legal review where ownership or derivation is uncertain.

None of these decisions, integrations, rename changes or notice changes is
implemented by this research.

## Primary sources

All live sources accessed **2026-10-02**. Moving docs/branches are dated
observations, not permanent version pins. npm tarballs were read in memory,
not installed/executed.

1. [npm `heroui-cli` metadata](https://registry.npmjs.org/heroui-cli) and
   [3.0.5 published artifact](https://registry.npmjs.org/heroui-cli/-/heroui-cli-3.0.5.tgz):
   version/time/engines/license/bin and actual command implementation.
2. [npm React MCP metadata](https://registry.npmjs.org/@heroui%2freact-mcp) and
   [1.1.2 published artifact](https://registry.npmjs.org/@heroui/react-mcp/-/react-mcp-1.1.2.tgz):
   license, stdio tool registrations, API endpoints and environment variables.
3. [npm React metadata](https://registry.npmjs.org/@heroui%2freact) and
   [3.2.6 artifact](https://registry.npmjs.org/@heroui/react/-/react-3.2.6.tgz):
   publication date and metadata/shipped-license discrepancy.
4. [npm styles metadata](https://registry.npmjs.org/@heroui%2fstyles) and
   [3.2.6 artifact](https://registry.npmjs.org/@heroui/styles/-/styles-3.2.6.tgz):
   publication date and metadata/shipped-license discrepancy.
5. [Official HeroUI MCP documentation](https://heroui.com/docs/react/getting-started/mcp-server).
6. [Official HeroUI agent-skills documentation](https://heroui.com/docs/react/getting-started/agent-skills).
7. [Official React skill source](https://github.com/heroui-inc/heroui/tree/v3/skills/heroui-react),
   including [SKILL.md](https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-react/SKILL.md)
   and [list helper](https://raw.githubusercontent.com/heroui-inc/heroui/v3/skills/heroui-react/scripts/list_components.mjs).
8. [Official current CLI documentation](https://heroui.com/docs/react/getting-started/cli).
9. [Official CLI source](https://github.com/heroui-inc/heroui-cli) and
   [package manifest](https://raw.githubusercontent.com/heroui-inc/heroui-cli/main/package.json).
10. [Pinned HeroUI source license](https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/LICENSE)
    and [complete pinned source archive](https://codeload.github.com/heroui-inc/heroui/tar.gz/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e):
    authority and NOTICE inventory.
11. [Apache License 2.0, especially §§4 and 6](https://www.apache.org/licenses/LICENSE-2.0).
