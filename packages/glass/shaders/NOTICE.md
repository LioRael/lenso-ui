# Shared renderer provenance

The iOS 27 optical shader ports the existing Lenso equations in
`packages/glass/src/refraction.ts`, `apple-material.ts` and
`packages/tokens/src/materials/index.ts`. The Snell profile retains the
adaptation credited to Copyright (c) 2026 Kelvin Zhang; see the MIT text in
`LICENSE.txt`. Lenso's retained material work and notices
remain covered by the repository's `THIRD_PARTY_NOTICES.md`, including applicable
MIT and LGPL-2.0-or-later terms. No Apple design-kit assets are redistributed.

The default TypeScript Web adapter and the retained Rust/Wasm comparison adapter
derive from the route lab's WebGL drivers (MIT). The TypeScript driver and GLSL live in `packages/glass`; Rust/Wasm is isolated in `experiments/glass-driver-comparison`.
Both consume the same retained GLSL sources. No MyGo runtime,
shader source or assets are copied. MyGo informed the architectural comparison,
not the material appearance or this prototype's source.
