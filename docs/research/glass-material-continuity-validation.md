# Glass material and contour continuity

The later [material refresh follow-up](glass-material-refresh-validation.md)
supersedes the flat/full shading handoff described here after further user feedback.

This follow-up supersedes the material conclusions of the initial toolbar
detachment check. That check established motion, geometry and native control
behavior; it did not catch the visual defects subsequently reported by the user.

## Reference and diagnosis

The supplied Apple Photos screenshot shows a locally highlighted left control,
a neutral right control and one exterior contour through the two concave
shoulders. It does not show an internal border across the connecting material.
A screenshot establishes the appearance, not Apple's rendering implementation.

The Web implementation had four separate failures:

- A separate dark/white SVG rim replaced the controls' darker contour coverage.
- Unified rendering hid member press lighting while the replacement light lived
  underneath the member backdrop surfaces.
- Replacing nested SVG image masks during motion invalidated the material face.
  Optical-map image decoding could also expose an unfinished replacement.
- Detachable toolbar groups explicitly suppressed their shared elastic motion.

## Repair

Compatible glass controls now share an immediately updated CSS vector clip.
The connecting light uses a vector cutout of the original controls. Neither
requires loading a replacement image during the morph. Native member backdrop
filters are disabled while the shared face owns their material; the native pressed state drives a single light field above the shared material
and contour. The member copy is suppressed only after that field can take over,
so the light crosses the shoulder without a hard cut or a doubled fill.

A persistent, image-free material-transfer lens supplies the face while the
geometry changes. Geometry-specific refraction is coalesced after 80ms of stable
geometry, with decoded inputs and an 80ms opacity handoff above that face.
Live-backdrop members take over immediately on separation. Copied or painted
members retain the shared base for their next rendering writes, following their
current independent geometry so it does not leave ghost shapes.

The exterior is rasterized directly at twice the CSS resolution from the same
outline used for clipping. The native contour constants inform its coverage;
the alpha composite over the completed Web face remains an approximation of
the native subtractive edge. It is not a claim of native pixel equivalence.
Rasterizing the actual silhouette also avoids mistaking the blended field's
interior saddle for another edge through the neck.

Joined toolbar groups regain their shared elastic press/drag feedback.
Detached controls retain their individual feedback. The optional `isDetached`
API, existing focus/action ownership and reduced-motion arrangement are unchanged.
Consumers require no migration.

## Rendered evidence

Both Chromium and WebKit were exercised against a production-built fixture
importing the actual documentation stories and built component packages:

- Recorded real-speed light/dark splitting, joining, press and release, including
  36 toolbar frame captures per engine and six press captures per appearance.
- A fixed point on the unpressed neighbor stayed material-colored throughout
  press. Chromium's six light samples were `(157,176,202)` and its dark samples
  were `(64,106,163)`. The corresponding exposed blue background was approximately
  `(47,90,148)`, making the prior light-mode clearing readily distinguishable.
  WebKit samples varied by up to eight channel levels as refraction blended in,
  while retaining the material color throughout.
- The neck's exterior raster had two edge segments and zero alpha at its center.
  The intermediate toolbar silhouette had an occupied center, a 36px neck and
  44px controls, rather than appearing only after joining completed.
- Press enlarged the 50px demo control to approximately 70px and returned to
  50px. Mouse and synthesized touch each disconnected once at the threshold;
  connected release had no hidden frames or late reconnects.
- Horizontal, vertical, RTL, interrupted/reversed motion, native keyboard/actions,
  disabled/loading states, both themes, reduced motion, forced colors and 390px
  layout checks passed. Both engines reported no page or console errors.
- Joined toolbar bounds grew under pointer press in both appearances and engines.
  Attached bars were checked separately: their joined root grew approximately
  6px; after detachment the root stayed fixed and the pressed control grew
  approximately 18px. The group does not inherit and apply the bar's scale twice.
- After settling, both engines recorded zero fusion measurement ticks over an
  additional 350ms idle window. Lighting writes are skipped when unchanged.

The running documentation page at
`http://localhost:3000/en/docs/react/components/glass-container` was also rendered
and inspected after recovering its dev stylesheet state. The pressed control
keeps its pale highlight and its neighbor keeps its material.

Captures, frame metadata and recordings remain in the private session
visualization directory under `material-continuity/`; reference images are not
vendored into the repository.

## Checks and limits

Affected formatting/lint, glass/tokens/UI typechecks, root script typecheck,
thirteen glass tests, fifteen component/fusion/toolbar DOM tests, package builds
and the installed-consumer production check passed. Documentation contract
generation passed. The DOM preload now supplies empty browser animation
timelines because Happy DOM does not implement them; it does not simulate
rendering and is not the evidence for these pixel observations.

The complete testing-package typecheck still reports the pre-existing
`Tabs.Root variant` error in `packages/ui/test/components.dom.test.tsx:199`.
Unmarked backgrounds received an additional shape/press check: Chromium kept
its live backdrop path; WebKit material paints followed the vector outline
without filling the container rectangle. No native iOS device acceptance, full
production docs export or repository-wide candidate gate was performed.
Refraction detail, fallback rendering and mixed material recipes are not
established as native-equivalent by these checks.

## Scoped delivery gate

- Hard Gate PASS: real split/join and counter actions, keyboard operation, both
  themes and 390px layout were exercised in both engines, with no console errors.
  This repair introduces no fabricated content, navigation or new async UI flow.
- Purpose Gate PASS: the shared face prevents exposed-background frames, the
  direct exterior contour removes internal seams, and local lighting identifies
  the pressed action. The supplied Apple image is a visual reference.
- Liveliness PASS: the existing docs direction remains energy 1, rhythm 1,
  motion 2. Grouping and pressing are the deliberate motion accents; the existing
  typography, semantic palette and page layout remain in use.
- Craftsmanship PASS for this scope: the pixel observations above accompany
  geometry, action, focus, cleanup and accessibility-preference regressions.
  Native optical parity and unperformed gates are explicitly excluded.
