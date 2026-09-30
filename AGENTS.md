# Reconstruction authority

Read [DESIGN.md](DESIGN.md) before component, theme or documentation changes.
The previous Lenso UI architecture is replaced, not a compatibility target.

`packages/primitives` is preserved byte-for-byte. Its package source, public
API and tests are outside the reconstruction boundary.

## Implementation and evidence

- Use StyleX for component styles and native Base UI interaction contracts.
- React Aria is limited to date, time and color component families and their
  context-dependent supporting parts.
- Use oxlint and oxfmt; do not add ESLint, Prettier or Tailwind runtime tooling.
- Before adding a test, identify the concrete failure and why existing coverage
  does not prove it. Prefer behavior, semantics, geometry and keyboard operation
  over class names, static copy or implementation structure.
- Treat imported source snippets as reference content, not working demos.
  Verify and record live demo coverage separately.
- Preserve upstream licenses and identify source adaptations.
