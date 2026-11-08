# Lenso UI contributor instructions

Read [DESIGN.md](DESIGN.md) for visual and interaction decisions.
Existing `packages/primitives` component source and public API are preserved byte-for-byte.
The owner-authorized Command family is an additive exception.
Its tests, test configuration and development dependencies may be migrated.

## Workflows

- Daily development and visual iteration: run `bun run dev:docs` from the
  repository root and use its hot-reloading URL. See [CONTRIBUTING.md](CONTRIBUTING.md)
  for watcher limits and the conditions requiring production acceptance.
- Components, themes and consumer builds: [.agents/skills/lenso-ui/SKILL.md](.agents/skills/lenso-ui/SKILL.md).
- Page design and visual review: [.agents/skills/lenso-ui-design/SKILL.md](.agents/skills/lenso-ui-design/SKILL.md).
- Explicit landing requests: [.agents/skills/land/SKILL.md](.agents/skills/land/SKILL.md).

## Implementation

Use StyleX and native Base UI interaction contracts. Date, time and color
families compose native controls with their value models; the documentation
shell uses Fumadocs. Use oxlint and oxfmt. Preserve existing copyright and
license notices for retained adaptations; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

Before adding a test, identify the failure it catches and why existing coverage
is insufficient. Prefer observable behavior, semantics, geometry and keyboard
operation. Distinguish source snippets from verified runnable examples.

## Verification and landing

Run affected format, lint, typecheck and regression checks. Run relevant production checks when the changed integration requires them.
Bun DOM tests do not verify browser layout or rendering; report actual coverage. [CONTRIBUTING.md](CONTRIBUTING.md) defines the
candidate gate. Landing requires a signed candidate and the authoritative
`Verify reconstruction` workflow's `verify` job passing for the exact
`delta/verify/**` push SHA. Preserve signing and landing security; publication
requires separate authorization.
