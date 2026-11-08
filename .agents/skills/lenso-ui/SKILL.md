---
name: lenso-ui
description: Build or debug Lenso UI components, themes, and consumer integrations with the matching component contracts and StyleX pipeline.
---

# Work with Lenso UI

1. Read the project's design direction and inspect the installed `@lenso/ui`,
   `@lenso/tokens` and framework versions. In this repository, inspect current
   source and maintained scripts; do not treat an old generated contract as proof.
2. Resolve the actual exported parts, props and examples for each affected family.
   Use the matching installed CLI/MCP contract when available; follow
   [query.md](references/query.md) for version and digest checks. An imported
   snippet is reference content until its live behavior has been verified.
3. Preserve Base UI interaction ownership, native props, refs, keyboard and
   focus behavior. Compose semantic StyleX maps with caller `xstyle` last and
   retain runtime style variables. See [composition.md](references/composition.md).
   When changing forms, focus, material ownership or docs navigation, read
   `docs/design/component-conventions.md` in the Lenso UI checkout and
   inspect its linked source before changing the shared rule.
4. For theme changes read [theming.md](references/theming.md); for consumer
   CSS/build delivery read [setup.md](references/setup.md). For page appearance
   use the sibling [design workflow](../lenso-ui-design/SKILL.md).
5. In this repository, iterate with `bun run dev:docs` and its hot-reloading
   URL. Follow the repository's `CONTRIBUTING.md` for watcher limits,
   affected checks and production acceptance conditions. Run affected type,
   lint and regression checks. Exercise relevant keyboard,
   focus, overlay, responsive and theme states in the actual rendering surface.
   Report what was verified and what remains untested.
