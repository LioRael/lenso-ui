---
status: accepted
---

# Ship foundations in packages and product compositions as recipes

The initial public component set covers the 21 product-neutral families currently specified in Figma, from Button through Disclosure. More opinionated Sidebar, Page Header, Settings List, Empty State, Page Layout, and Selection Bar compositions begin as editable registry Recipes rather than stable styled package APIs; page templates remain documentation and acceptance examples.

A composition may additionally produce a stable headless Product Primitive when it has a meaningful visual-independent state and interaction model that serves multiple Recipes or Consumers. Sidebar is the first candidate: `@lenso/ui/sidebar` owns its headless compound behavior while styled App and Settings sidebars remain Recipes. A Figma page or visual layout alone is not sufficient reason to create a Product Primitive.
