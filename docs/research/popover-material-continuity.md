# Popover material continuity

Date: 2026-11-08

## Reference and failure

Read the supplied local `lenso-apple-ios-ipados27-source-20261027.fig` archive
without modifying it. Example `12740:35199` references component `61:65422`.
Its body Material `513:95250` and arrow Material `5433:21565` both reference
material component `510:79108`. The arrow is 56 × 13 and both shapes use a
130-radius background blur in the design data. This is structural evidence,
not a freshly exported Figma image or a native platform rendering guarantee.

The previous implementation painted the body outside the popup while painting
the arrow locally. These different compositing scopes produced a visible join;
the detached body paint could also drift when the page was scaled. The existing
DOM tests did not exercise either rendering or scaled geometry.

## Change

The default arrow now supplies geometry to one local material silhouette that
includes the rounded body. A single backdrop filter and thick paint stack draw
both parts. Base UI retains positioning, collision adjustment, arrow placement,
opening/closing and focus ownership. The background follows the native popup's
transform and page scaling without a separately positioned paint copy.

Geometry updates observe popup resizing, native arrow positioning and changes
between arrow/no-arrow compositions. Custom arrow children remain caller-owned.
Before client measurement, the body keeps its ordinary rounded surface.
The internal MaterialBackground layer style now also applies to ordinary
material paints, allowing this surface to own the sole blur pass.

No public props or consumer migration steps change. Regenerate/rebuild the
styles package when consuming the updated implementation from package output.

## Validation

`DOCS_URL=http://localhost:3000 bun run --filter @lenso/ui-docs test:popover-material`
checks Chromium and WebKit, light/dark appearance, four physical sides and CSS
zoom 100%, 125%, 150%, 200%, then 100%. It measures the actual background bounds
against the popup, checks the shared mask, and exercises Escape/focus return.
Chromium screenshot pixels additionally check the arrow/body join and blur over
alternating colored stripes. Screenshots used for inspection are separate from
the maintained test and are not retained by it.

Format/lint, UI/styles/docs typechecks and the styles package build pass.
The glass suite passes 36 tests and its backdrop placement DOM test passes.
The existing tooltip material DOM regression passes. A broader component DOM
run had 10 passes and an unrelated failure in elastic text press feedback
(`elastic text editing keeps press feedback without drag deformation`, expected
scale greater than 1, received 1); it was not changed in this correction.

The installed automated WebKit renderer does not draw native backdrop blur,
including in a standalone unmasked `backdrop-filter: blur(65px)` control case.
Its geometry, scaling, semantics and focus checks pass; blur pixel acceptance
therefore applies to Chromium only. Real Safari/iOS rendering, browser toolbar
zoom, production acceptance and same-revision Figma pixel parity were not run.
The automated scaling coverage uses CSS zoom, not browser toolbar controls.
