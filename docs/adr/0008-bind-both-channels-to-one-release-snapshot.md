---
status: accepted
---

# Bind both distribution channels to one release snapshot

Every release will give `@lenso/ui`, `@lenso/primitives`, `@lenso/tokens`, and the registry the same version, generate all artifacts from the same Git tag, and record them in one release manifest. `@lenso/fonts` joins that release group only after its provenance bundle is complete. Registry artifacts have immutable versioned addresses for reproducible installation, while a latest alias may point to the newest release without becoming its identity. Lockstep versioning will be reconsidered only after the 1.x line is stable enough to justify an independent compatibility matrix.
