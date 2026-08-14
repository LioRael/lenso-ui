---
status: accepted
---

# Use named subpath exports and source-local tests

Public components and types are named exports from explicit family subpaths such as `@lenso/ui/button`, `@lenso/ui/dialog`, and `@lenso/primitives/sidebar`. The component packages do not expose default exports or an all-components root barrel. Compound families use namespaces such as `Dialog.Root` and `Dialog.Content` where that composition follows the Base UI or Product Primitive model.

Each component family owns one source directory and adds files only when they carry a real responsibility. Implementation, StyleX styles, tests, and the subpath index stay local to that family; complex families may add focused accessibility or state tests without imposing an identical file template on simple components. Registry metadata is declared centrally and compiled into shadcn registry JSON rather than duplicated as hand-maintained JSON beside each component.
