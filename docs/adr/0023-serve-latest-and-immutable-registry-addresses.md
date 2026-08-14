---
status: accepted
---

# Serve latest and immutable registry addresses

The documentation origin serves the shadcn registry under `/r`. `/r/{name}.json` is the mutable current-stable alias used by the `@lenso` namespace, and `/r/v/{version}/{name}.json` is an immutable Release Snapshot address. The public namespace configuration resolves `@lenso/{name}` through `https://ui.lenso.dev/r/{name}.json`. Hosting implementation may change, but these public paths and valid shadcn registry schemas remain stable.
