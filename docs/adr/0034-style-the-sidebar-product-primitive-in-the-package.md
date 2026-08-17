status: accepted
supersedes: ADR-0009, ADR-0020
---

# Style the Sidebar Product Primitive in the package

The styled `@lenso/ui/sidebar` adapter will depend on `@lenso/primitives/sidebar` and will remain the canonical Lenso visual implementation for the Sidebar public subpath. The primitive package owns the headless state, compound parts, accessibility behavior, and focus lifecycle; the UI package owns StyleX styles, semantic token usage, and the visual `Sidebar` composition. The dependency remains one-way: `@lenso/primitives` never imports `@lenso/ui`.

The registry may also distribute the same Sidebar behavior as an editable Sidebar Recipe. This keeps the package channel and registry channel aligned without forcing a Consumer that needs a different visual language to install the styled package. Page Header, Settings Row, and other product-oriented compositions may continue to be distributed as package components or registry items according to their current public export and registry specification.
