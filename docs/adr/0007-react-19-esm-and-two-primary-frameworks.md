---
status: accepted
---

# Target React 19 and ESM with Vite and Next as primary environments

Lenso UI will target React 19 and publish ESM rather than inheriting Base UI's older React compatibility range. Vite SPA and Next App Router are the primary tested consumer environments. Interactive Base UI wrappers use explicit component subpath exports such as `@lenso/ui/button` and are Client Components; tokens, types, and static utilities use separate server-safe subpaths. No root barrel re-exports the complete component library.
