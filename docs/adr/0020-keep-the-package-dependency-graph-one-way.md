---
status: superseded
superseded-by: ADR-0034
---

# Keep the package dependency graph one-way

The monorepo contains `apps/docs`, `packages/ui`, `packages/primitives`, `packages/tokens`, `packages/fonts`, `registry`, and the narrow token and registry build tooling. It does not retain framework consumer fixtures. `@lenso/ui` depends on `@lenso/primitives`, `@lenso/tokens`, `@stylexjs/stylex`, and `lucide-react`, and declares React, React DOM, and Base UI as peers. `lucide-react` is an implementation dependency rather than a peer and does not leak through public types. `@lenso/primitives` declares React and Base UI as peers. `@lenso/tokens` depends on StyleX, while `@lenso/fonts` has no runtime dependency on another Lenso package. The dependency graph remains one-way: the primitives package never depends on the styled UI package. The Sidebar-specific reason for the UI-to-primitives edge is recorded in ADR-0034.
