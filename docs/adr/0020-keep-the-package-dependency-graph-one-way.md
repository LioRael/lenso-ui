---
status: accepted
---

# Keep the package dependency graph one-way

The monorepo contains `apps/docs`, `packages/ui`, `packages/primitives`, `packages/tokens`, `packages/fonts`, `registry`, and the narrow token and registry build tooling. It does not retain framework consumer fixtures. `@lenso/ui` depends on `@lenso/tokens` and `lucide-react`, and declares React and Base UI as peers; Motion is an optional peer used only by bounded components. `lucide-react` is an implementation dependency rather than a peer and does not leak through public types. `@lenso/primitives` declares React and Base UI as peers. `@lenso/tokens` and `@lenso/fonts` have no runtime dependency on another Lenso package. `@lenso/ui` does not depend on `@lenso/primitives`; registry Recipes may compose both public surfaces.
