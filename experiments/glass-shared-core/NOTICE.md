# Prototype provenance

The iOS 27 optical shader ports the existing Lenso equations in
`packages/glass/src/refraction.ts`, `apple-material.ts` and
`packages/tokens/src/materials/index.ts`. The Snell profile retains the
adaptation credited to Copyright (c) 2026 Kelvin Zhang; see the MIT text in
`../glass-route-lab/LICENSE.txt`. Lenso's retained material work and notices
remain covered by the repository's `THIRD_PARTY_NOTICES.md`, including applicable
MIT and LGPL-2.0-or-later terms. No Apple design-kit assets are redistributed.

The Web adapter uses the package-owned Rust/WebGL driver, derived from the route lab. No MyGo runtime,
shader source or assets are copied. MyGo informed the architectural comparison,
not the material appearance or this prototype's source.
