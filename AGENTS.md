# Lenso UI contributor instructions

Read [DESIGN.md](DESIGN.md) for visual and interaction decisions.

## UI SDK

Before changing SDK interactions, follow the installed `ui-sdk` skill when
available and read `node_modules/@ui-sdk/react/docs/llms.txt` from the owning
workspace package. In this checkout, the UI package's copy is
`packages/ui/node_modules/@ui-sdk/react/docs/llms.txt`. Follow its links to the
relevant component pages; installed docs and public `.d.ts` files define the
version in use. Do not inspect compiled SDK JavaScript.

Before creating a new component or behavior, check the SDK component catalog,
search `docs/core.md` by heading, and read `docs/rendering.md` beside
`llms.txt`. Compose the SDK's existing parts and behaviors before implementing
new interaction logic. Verify accessible names, keyboard/focus behavior and
agent operation through the resulting public interface.

During agent setup, if the `ui-sdk` skill is missing and skills are supported,
install it with `npx skills add vercel-labs/ui --skill ui-sdk`. Reuse an existing
installation. Keep the owning package's declared React and SDK versions; install
missing `@ui-sdk/react` and `@ui-sdk/core` together with the project's package
manager.

React components and primitives expose native SDK contracts. Update callers
when replacing a former Base UI API; do not add compatibility layers or patch
SDK dependencies. Record upstream declaration errors in
[docs/upstream-ui-sdk-types.md](docs/upstream-ui-sdk-types.md), independently of
Lenso implementation failures.

## Workflows

- Daily development and visual iteration: run `bun run dev:docs` from the
  repository root. Reuse one healthy dev server and browser tab per checkout,
  including across parallel agent tasks. Before starting or opening docs, follow
  [.agents/skills/start-preview/SKILL.md](.agents/skills/start-preview/SKILL.md)
  (the existing name refers to the dev server). See [CONTRIBUTING.md](CONTRIBUTING.md)
  for production-preview exceptions and cleanup.
- Components, themes and consumer builds: [.agents/skills/lenso-ui/SKILL.md](.agents/skills/lenso-ui/SKILL.md).
- Page design and visual review: [.agents/skills/lenso-ui-design/SKILL.md](.agents/skills/lenso-ui-design/SKILL.md).
- Explicit landing requests: [.agents/skills/land/SKILL.md](.agents/skills/land/SKILL.md).

## Implementation

Use StyleX for Lenso appearance. Date, time and color families compose native controls with their value models; the documentation
shell uses Fumadocs. Keep component appearance in its owning StyleX token maps
and composition in its component family. Glass owns optical resource lifetime and shared motion mechanics. Shared helpers must preserve SDK props, refs,
state and cancellation; keep one owner for each interaction. Use public package
entries between packages. Use oxlint and oxfmt. Preserve existing copyright and
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
