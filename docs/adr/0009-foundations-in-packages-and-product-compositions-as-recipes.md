---
status: superseded
superseded-by: ADR-0034
---

# Ship foundations in packages and product compositions as recipes

The initial public component set covers the product-neutral families specified in Figma. More opinionated compositions may begin as editable registry Recipes rather than stable styled package APIs; page templates remain documentation and acceptance examples. The current Sidebar boundary is defined by ADR-0034: its headless Product Primitive is published from `@lenso/primitives`, its styled adapter is published from `@lenso/ui`, and the editable registry Recipe remains available for Consumers that need source ownership.

A composition may additionally produce a stable headless Product Primitive when it has a meaningful visual-independent state and interaction model that serves multiple Recipes or Consumers. Sidebar is the first such primitive. A Figma page or visual layout alone is not sufficient reason to create a Product Primitive.
