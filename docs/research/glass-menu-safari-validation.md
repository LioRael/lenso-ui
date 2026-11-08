# Shared-core Menu and Safari validation

Date: 2026-11-06

Opening-path follow-up: [Safari Menu opening investigation](glass-menu-safari-opening-validation.md). It records the duplicate-capture fix, document mounting changes and the remaining long-frame acceptance failure.

## Result and scope

The default Menu documentation playground now displays a shared-core owned background snapshot in Chromium and native Safari 27.2. The iOS/iPadOS material, content, positioning and Base UI interactions are retained. This verifies the default root popup; it does not establish shared-core coverage for every submenu, custom material, arbitrary DOM backdrop or platform.

The documentation capture now records the resolved gradient masks used by Tabs and ScrollShadow, their exclusion composition, even-odd paths and rounded inset clips. Paint remains inside each ancestor's mask/clip scope. Unsupported paint still retains the existing material. Nested backdrop copies include retained shadow bitmaps. Complete material snapshots inherit the lens border radius at the clipping container, removing rectangular corner leakage observed in the final Safari check.

Owned captures can derive the analytic material from the control's geometry without requiring a browser-installed SVG backdrop filter. Opaque page captures explicitly report their opacity to the renderer, which avoids a pixel readback solely to rediscover that property. Safari omitted `alpha` from the context attributes observed in this run; treating an absent attribute as a transparent canvas prevented activation. Readbacks of the earlier canvas path also returned alpha 254, which failed the exact opacity gate. An opaque canvas selected from the known opaque page color now supplies a complete source, without relaxing the gate for unspecified captures.

## Native Safari observations

Actual Safari application, not Playwright WebKit. User agent reported Safari 27.2. Viewport 1512 × 778 CSS pixels, DPR 2. The target was the existing development documentation at `/en/docs/react/components/menu`.

- Light and dark root popups produced `data-glass-backdrop-snapshot` + `data-glass-renderer="shared-core"`, at 238 × 201 CSS pixels. A temporary observer collected the marker state in Safari and was removed afterward.
- The material shows the blue scene behind the upper portion and the documentation/Tabs area behind the lower portion. Labels remain readable in the reviewed states.
- Reopening, Escape dismissal, keyboard selection/activation of Edit and focus return to Actions were exercised.
- The 10 pixel regression assertions passed in Chromium and Safari. They check gradient opacity, descendant compositing, preservation of earlier page paint, Tabs capsule exclusion, even-odd holes, rounded inset clips and unsupported-mask fallback. Existing DOM tests cannot verify these Canvas/SVG pixels.

The retained regression fixture is `apps/docs/test/menu-backdrop-mask.html`. To run against the docs development server, temporarily copy it to `apps/docs/public/menu-backdrop-mask.html`, open `/menu-backdrop-mask.html`, inspect the JSON result, and remove the public copy. The temporary public copy was removed after these checks.

## Performance measurements

Each sample records eight seconds of requestAnimationFrame intervals surrounding a native pointer activation and the resulting open popup. These are local development measurements, not production A/B results, GPU timings, battery measurements or evidence of constant 60 fps. The eight-second percentile includes the much longer static open state, so it must not hide the opening spikes.

| Safari sample                                   | Frame intervals p95 | Maximum interval | Intervals > 50 ms | Background preparation | Pointer to shared output |
| ----------------------------------------------- | ------------------: | ---------------: | ----------------: | ---------------------: | -----------------------: |
| First shared-core open after reload             |               18 ms |           140 ms |                 4 |                 182 ms |                 1,098 ms |
| Reopen                                          |               18 ms |           127 ms |                 3 |                 150 ms |                 1,000 ms |
| Reopen, no accessibility reads during sample    |               18 ms |           156 ms |                 2 |                 136 ms |                 1,018 ms |
| Dark open, no accessibility reads during sample |               18 ms |           140 ms |                 5 |                 150 ms |                 1,025 ms |

Shared output is installed after the existing opening motion/foreground readiness gate and background preparation; the original material remains visible beforehand. The ~1 second figure is the time until shared output, not an invisible or unresponsive menu. The first observed `data-open` event was 132–172 ms after pointer activation in these samples. Measurements precede the final border-radius clipping correction; that correction was visually rechecked in Safari and Chromium, without a new performance claim.

The light reopen sample without accessibility reads had a 22 ms maximum once in its static-open segment; the dark sample still had two long intervals in that segment, reaching 99 ms. Opening is therefore **not performance accepted**: 127–156 ms spikes remain, and no trace in this pass attributes them exclusively to Wasm, background capture, legacy filter preparation or Menu motion. The next performance work should profile the opening path and the post-motion handoff. No speedup over the previous renderer is claimed.

Raw reports and screenshots are saved under `/Users/leosouthey/.codex/visualizations/2026/11/06/01a1afcc-7814-7cd3-a626-6dd7915f00d9/glass-core/menu-safari/`. `reports.jsonl` includes earlier rejected attempts; the successful measurements above are the final four records for `glass-perf=4`. `probe.js` preserves the temporary frame observer; it is not part of the documentation application.

## Checks and delivery limits

- Glass build and typecheck passed (57 files).
- Documentation typecheck passed (2,245 files).
- Affected format and lint checks passed.
- Glass unit tests: 23 passed; targeted DOM tests: 4 passed.
- Installed consumer check passed: exports, types, SSR and production assets.
- Pixel fixture: 10 assertions passed in each of Chromium and native Safari.
- Temporary diagnostics and public test copies were removed. The user-facing documentation was rechecked afterward, and Safari's original light appearance was restored.

No full production documentation build, mobile Safari/device test, full component/material matrix, release, deployment or landing was performed. This validates Menu integration and identifies the remaining opening performance problem; it is not overall performance acceptance.
