# Default shared Glass core integration

Date: 2026-11-06. Local workspace only; no publication or landing.

Follow-up: [TypeScript/Wasm driver comparison](glass-driver-comparison-validation.md).
The default Web driver now uses TypeScript with the same GLSL; this document
records the earlier Wasm-backed integration rather than the current driver choice.

## Behavior

`@lenso/glass` now automatically selects the Rust/Wasm/WebGL2 analytic renderer
for supported iOS/iPadOS 27 Small/Medium rounded rectangles over self-contained,
opaque marked CSS backgrounds. Component props and public runtime exports are
unchanged. Existing observation, source capture, dirty tiles, visibility, DOM
rim/highlights, foreground and interaction ownership remain in place.

The core is owned by `packages/glass/renderer`; the comparison experiment reuses
it. Its default `web` feature provides the browser adapter. Disabling default
features builds the optical core without browser dependencies. Native rendering
adapters are not implemented by this change.

Wasm is embedded in a lazy JS chunk, with generated bindings and a source/lockfile
hash. Consumers need no Wasm URL or Rust toolchain. Current unminified shared-core
chunk is about 38 KB gzip, including encoded Wasm and glue; this differs from the
previous separate-file prototype's approximately 27 KB combined gzip transfer.

Chromium retains its original native backdrop sampling until replacement pixels
are ready, and restores it on failure. Unsupported Canvas/DOM paint is not
replaced with an incomplete cloned source. WebKit preserves its existing copy
fallback. A press scale keeps the group while temporarily falling back; hidden
canvas outputs stay current so a reveal cannot restore stale pixels.

## Browser observations

Native Safari 27.2 and in-app Chromium on macOS 27.2. The consumer fixture imports
built `@lenso/ui` GlassButton components and the built Glass runtime, with compiled
StyleX token declarations. It is not the independent optical comparison scene.

- Light Small and dark Medium initialized on the shared core. Safari showed
  16/16 active controls in the full window.
- A self-contained DOM background animated under the real controls. Informal
  rolling RAF p95 observations were around 18 ms for Small and 20–34 ms for Medium
  in Safari. These are not controlled presentation or energy benchmarks.
- Chromium also selected the shared core, with single-digit/teen-millisecond
  rolling RAF observations depending on animation and viewport. Offscreen
  controls are deliberately excluded; active counts depend on viewport size.
- Pointer activation in Safari and Space activation in Chromium incremented the
  actual button activation counter.
- Unmount removed the output controls; remount restored shared rendering.
- Actual `WEBGL_lose_context` restored complete fallback rendering. In Chromium,
  both shared-core count and `data-copy` count dropped from 16 to zero, restoring
  native backdrop sampling. Remount restored shared rendering.
- `?content=canvas` kept shared-core count and `data-copy` count at zero in Chromium;
  the painted Canvas and its text remained visible and refracted behind controls.
- `?hidden=1` exercised an initially transparent first control. Revealing it
  increased the visible shared count by one and set its `data-copy` marker,
  without requiring a source change or remount.

An earlier dark Medium session was observed at 0/16 after animation had begun.
The transition reason was not captured. Subsequent sustained sessions stayed
16/16; this does not establish the cause of the earlier transition. It remains
an unclassified observation rather than a claimed fixed root cause.

## Checks

Passed:

- Glass package production build and declaration emission.
- Glass and experiment TypeScript checks; affected formatting; package/experiment lint.
- 22 Glass unit tests, including material-selection boundaries, actual Wasm
  instantiation and source/lockfile hash freshness.
- Three affected DOM tests for backdrop paints and immediate material appearance.
- Four legal attribution tests.
- Installed-consumer check: package exports, declaration use, SSR, production
  bundling and shipped source/legal assets. Its first follow-up run exposed stale
  notice copies in the already-built UI/tokens packages; these were synchronized
  and the check passed afterward.
- Native Cargo fmt/check/test/clippy (`-D warnings`)/doc for the retained renderer;
  three default-feature tests and one browser-free core test passed.
- Experiment workspace native check/test/clippy and release Wasm build after
  moving kernel ownership. The experiment crates now forward to the production
  crate; the physics and record-validation tests live in that crate.

Existing broader checks were not all green: four knob-shadow DOM tests fail in
unchanged `apple-material.ts`, and two agent-skill packaging tests reject existing
references outside the copied skill bundle. These paths were not changed to
make the checks pass. No full-repository or landing acceptance is claimed.

## Limits

The analytic path retains the prototype's approximation differences from encoded
SVG maps, quantization, smoothing and browser rasterization. Custom optical
settings/tints, other profiles, fusion/content geometry, scaled output and
unsupported/transparent or arbitrary DOM capture retain existing rendering.
DPR is currently limited to 1 or 2 and per-group resource budgets are enforced.

The runtime still prepares legacy maps for fallback, so cold setup can contain
long frames. No site-load, memory/energy, screen-reader, real iPhone/iPad,
low-end Android, Firefox or complete documentation navigation acceptance was
performed. An installed-consumer check is not release/deployment or full visual
acceptance. There is no default-backend toggle exposed to callers.

## Reproduce

Build packages as required by the checkout, then:

```sh
bun experiments/glass-shared-core/consumer-server.ts
```

Open `http://127.0.0.1:4198/`. Use `?theme=dark&profile=medium`,
`?content=canvas`, or `?hidden=1` for the corresponding cases. The animation,
context-loss and mount controls exercise real browser and component behavior.
The shared-core count denotes active outputs, including visibility qualification.

Screenshot and command receipts are retained in the local visualization artifact
folder `glass-core/default-integration` for this chat.
