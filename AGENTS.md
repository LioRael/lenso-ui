## Agent skills

Before UI or token work, read [DESIGN.md](DESIGN.md). It explains semantic-token selection, component choice, theme obligations, and the boundary between shared UI and product composition.

### Issue tracker

Issues and specs are tracked as GitHub issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the five canonical Matt Pocock skill labels without overrides. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository with `CONTEXT.md` and `docs/adr/` at the root. See `docs/agents/domain.md`.

## Testing discipline

- Before adding a test, name the concrete failure it prevents and explain why existing coverage does not catch it.
- Prefer observable behavior, public contracts, and real regressions. Do not add tests for simple prop forwarding, configuration constants, static copy, or purely decorative changes by default.
- Do not couple tests to class names, private DOM structure, complete HTML strings, or a CSS implementation technique unless that detail is an explicit public contract or protects a documented browser, security, or protocol regression.
- Verify a behavior at the lowest-cost layer that proves it. Browser tests must exercise a real browser dependency and should not duplicate an equivalent unit test.
- For visual behavior, focus on theme propagation, visibility, occlusion, overflow, and interaction geometry. Exact visual baselines need a stated acceptance purpose; avoid copying token values across many tests.
- Keep one focused proof for each applicable contract category: visual state and geometry, accessibility semantics, and keyboard behavior. These checks are required for changed interactive surfaces, but overlapping fixtures and broad state matrices should be merged or reduced.
- When behavior changes, update or merge existing coverage instead of mechanically adding another test file.
