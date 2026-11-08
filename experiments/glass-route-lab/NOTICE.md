# Experiment provenance

The Snell-law profile and rounded-rectangle displacement in `shaders/glass.frag`
are adapted from the repository's glass renderer. `kernel.ts` is copied
from the earlier `experiments/glass-map-wasm` experiment.
Copyright (c) 2026 Kelvin Zhang. The MIT license is reproduced in `LICENSE.txt`.

The material recipes are adapted from this repository's audited
`packages/glass/src/apple-material.ts` and the local Apple design-kit
measurements. No Apple kit, SF Symbol, font or template asset is redistributed.

Aave's article informs direct filtering of owned DOM content, symmetric map
generation and one shared renderer for video lenses. No Aave runtime code or
assets are copied. The implementation and limitations here are this experiment's.

The HTML-in-Canvas lifecycle follows Chrome's API documentation. No third-party
sample application is vendored. Rust uses wasm-bindgen, js-sys and web-sys through
their published packages and retains those dependencies' own licenses.
