---
status: accepted
---

# Release the public surface as a Changesets fixed group

Changesets manages versions and changelogs. `@lenso/ui`, `@lenso/primitives`, `@lenso/tokens`, and the optional `@lenso/fonts` form one fixed group: a releasable change to any member gives every member the same new version and publishes them together. The release pipeline generates the registry snapshot and release manifest at that version from the same Git tag. The project will not maintain a separate custom package-versioning system.
