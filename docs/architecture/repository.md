# Repository structure

Lenso UI and Lenso Docs are independently maintained products. Public package
names and exports remain stable. `packages/primitives` component source and
public API are preserved byte-for-byte.

```text
apps/
  docs/                 Product documentation and daily component development
  docs-starter/         Independent documentation-framework consumer
packages/
  ui/                   @lenso/ui components and their local tests
  tokens/               @lenso/tokens themes and StyleX maps
  glass/                Shared rendering and motion
  primitives/           Preserved headless source and public API
  docs/                 @lenso/docs framework
  create-docs/          create-lenso-docs initializer and template
  devtools/             Private docs contracts and source analysis
  storybook/            Isolated stories and interactive accessibility diagnostics
scripts/                Repository-wide verification and release operations
tests/                  Repository and installed-consumer checks; shared DOM setup
docs/
  architecture/         Current ownership and integration decisions
  design/               Maintained design conventions and source principles
experiments/            Reproducible rendering and calibration investigations
.agents/                Agent entrypoints and skills
.github/                Signed verification and release orchestration
```

## Ownership

Implementation and local tests live together. The root test suite owns checks
that span packages or install the actual distribution. Its shared setup supports
multiple package suites; it is not a separate testing product.

`packages/devtools` is private. Docs generates product API/content projections;
the shared module owns contract encoding, source analysis and policy. Agent
integration lives in `.agents/skills/lenso-ui` and `lenso-ui-design`, with
portable references and licenses; see [agent integration](agent-skills.md). Repository setup, preview and landing skills
remain local contributor workflows.

`@lenso/docs` and `create-lenso-docs` retain their own packaging and verification.
`apps/docs-starter` checks the framework from an independent application. It
is not another product-docs inventory.

## Development surfaces

Use `bun run dev:docs` for daily source development. Storybook remains in its
existing location: its configured accessibility addon provides interactive
per-story diagnostics that the product docs do not expose. It also renders the
built UI package in isolated stories with controls. Registration or addon
availability alone does not certify accessibility or production acceptance.
Do not move this application solely to reclassify it, and do not add a second
copy of a docs example without a distinct diagnostic purpose.

The completed documentation-host comparison has been archived outside the
checkout. The current [documentation host](documentation-host.md) describes the
adopted integration; old prototype timings are not acceptance evidence for it.
Other experiments remain where they support current material or motion work.

## Configuration and generated files

Use one root `tsconfig.base.json`, `.oxlintrc.json` and `.oxfmtrc.json`.
Package-local configuration retains genuine environment differences and the
required build/test scopes. Do not introduce a `config` directory or another
configuration package. Root `scripts` contains only cross-product operations;
package generation and asset copying stay with their owner.

Generated intermediate data belongs in ignored `.cache`, except framework inputs
that require a source path. Package output belongs in `dist`; the product docs
export to `apps/docs/out`. Ignored `output` and `.artifacts` hold existing review
evidence and are excluded from source checks. Archive completed investigations
with a recoverable copy before removing them; preserve referenced recordings,
unapplied patches and any remaining verification limits.

Use the [documentation index](../README.md) to find maintained guidance and
[release notes](../../RELEASE.md) for consumer changes. Keep investigation
receipts outside the active documentation tree.

Delete forwarding modules after callers use the owning entrypoint. Completed
work becomes maintained guidance or leaves the active checkout. Keep applicable
copyright, license and provenance text with retained adaptations and verify its
presence in the distribution. A dependency patch needs a reproduced defect;
there are currently no registered dependency patches.

Run the affected checks in [CONTRIBUTING.md](../../CONTRIBUTING.md) after changes
to these boundaries. Directory cleanup does not replace the signed candidate
gate or authorize publication.
