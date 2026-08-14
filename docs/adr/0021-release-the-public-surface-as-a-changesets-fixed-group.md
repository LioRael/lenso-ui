---
status: accepted
---

# Release the public surface as a Changesets fixed group

Changesets manages versions and changelogs. `@lenso/ui`, `@lenso/primitives`, and `@lenso/tokens` form one fixed group: a releasable change to any member gives every member the same new version and publishes them together. `@lenso/fonts` remains private until its asset provenance is complete, then joins the fixed group. The release pipeline generates the registry snapshot and release manifest at that version from the same Git tag. The project will not maintain a separate custom package-versioning system.
