---
status: accepted
---

# Use one component source for both distribution channels

Canonical implementations will live in their owning workspaces and will produce both package and shadcn-compatible registry artifacts. Styled components publish through `@lenso/ui`, Lenso-owned headless Product Primitives publish through `@lenso/primitives`, and design tokens publish through `@lenso/tokens`. Registry generation may rewrite distribution-specific paths and metadata but will not maintain a second behavior implementation.
