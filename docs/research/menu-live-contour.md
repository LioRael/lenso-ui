# Menu foreground contour continuity

Date: 2026-11-08

## Defect

The reported rectangle was the foreground rim, not the animated panel bounds.
Menu and Select intentionally keep their optical input at its final layout size
and transform that input while their CSS corners counter-scale to the current
visible shape. The cached foreground rim image was also generated at that final
size/radius. It followed the transform but did not follow the changing corners.
The result was a rounded rectangle already visible around a circular glass face.
The previous closing geometry regression measured bounds, so it could not catch
this internal paint mismatch.

For example, mapping the old 250×600, radius-34 foreground image into a
113.283×109.077 opening frame places 64.7% of its alpha-weighted rim coverage more
than 2px outside the actual rounded contour. This is a direct pixel/model
characterization, not a before/after browser performance measurement.

## Repair

`createGlassContour` gives transformed material consumers a foreground painter
in visible coordinates. Root Menu, Select (including stationary triggers) and
cascading submenus supply their current width, height and corner from the same
pose that writes the surface and content clip. A 2× foreground canvas compensates
for the fixed optical input's scale, including its one-visible-pixel outside
hairline. The existing bitmap rim is suppressed while this live rim owns paint;
the fitted rim returns at rest. Cleanup releases the canvas and preference
subscription. Theme and material preferences invalidate the cached recipe.

This reuses the foreground's existing normal-based light/shade formula,
transparency response and pixel-area integration. The material face, backdrop
refraction, foreground content lens, fusion, Menu shape/timing and Base UI
interaction ownership are retained. It does not replace the glass with a CSS
border or disable refraction during motion.

A synchronous CPU prototype matched the outline but cost about 542ms for 28
sampled opening poses, so it was not retained as the normal motion path. The
live painter uses a shared offscreen WebGL2 program, with no per-frame PNG encode,
image decode or full optical refit. It skips the empty interior before integrating
edge coverage. Each consumer copies the completed foreground to its own canvas;
multiple owners therefore retain separate output. The existing CPU tile renderer
is the fallback when WebGL is unavailable. Ordinary layout-driven live rims keep
their existing CPU path.

## Verification and limits

- `apps/docs/test/live-rim-gpu.mjs` compares all pixels against the independent
  CPU foreground renderer: Chromium and WebKit × light/dark × small/medium/clear
  × three shapes = 36 comparisons. Maximum alpha error is 1/255, and maximum
  premultiplied color error is about 1.22/255.
- `apps/docs/test/menu-contour.mjs` reads the actual foreground raster and maps
  it into the rendered surface. It requires nonempty rim paint and less than
  1% of alpha coverage beyond a 2px contour tolerance. The main matrix covers
  text/icon Menu, selected-item-aligned Select and stationary Menu/Select,
  opening and closing, both engines and light/dark at DPR 2. It samples six
  intermediate times in each direction (240 raster checks). Source restoration
  and page errors are checked too. The separate `CONTOUR_KIND=cascade` run
  exercises the accelerated child-menu timeline: 44 visible raster samples pass
  across the same engine/appearance combinations; four initial samples are
  correctly transparent. All checked foreground alpha stays within the 2px
  contour tolerance.
- Appearance cases assert the material's computed mode. A first attempt changed
  only the theme marker and left the scope's light material recipe in place;
  that apparent dark coverage was discarded. The final dark runs mount an actual
  dark ThemeScope and pass in both engines.
- The original real-time preview received unrelated workspace HMR updates during
  testing, detaching mounted fixtures. Final geometry checks use an isolated
  preview with client HMR disabled. Those detached-fixture failures are not
  treated as material failures or successful acceptance.
- Seventeen targeted motion/ownership/submenu DOM tests and 36 glass unit tests
  pass. Affected format/lint/type checks, package builds and the installed-consumer
  production check pass. The existing TabBar motion check also passes at 590px,
  DPR 2, light appearance: 144 Chromium and 156 WebKit optical-continuity samples.
  This is a scoped shared-renderer regression, not the full TabBar matrix.

In an isolated 28-pose warm submission benchmark, Chromium's live foreground
paint plus consumer copy/style writes took 51.7–53.3ms in total, with a maximum
single submission of 2.3ms. WebKit's timer resolved 0–1ms totals, so that result
cannot establish its exact cost. These measurements exclude GPU completion and
are not total application CPU, frame-rate or energy acceptance. The 542ms CPU
prototype ran under Bun, not the browser; it is diagnostic evidence against that
prototype, not a valid engine-to-engine speedup ratio. No overall performance
improvement over the old cached-rim implementation is claimed.

Screenshots were inspected for an early circular foreground and intermediate
closing shapes. No fresh physical iPhone run or full-page visual acceptance was
performed. The repair addresses the detached foreground contour; it does not
claim recovery of Apple's exact animation or optics parameters.
