# GlassMagnifier for Exact Web

GlassMagnifier(id, draggable, animated, elastic) accepts rich child content. It
composes the existing Glass surface/optics/hotspot recipes with the shared
210×150, 75px radius magnifier recipe and 1.13 zoom input. The caller owns layout;
the example supplies a clipped, positioned parent through ordinary caller maps.
There is no new renderer or copied pointer/spring implementation.

The existing glassMotion helper owns pointer capture, parent-center clamping,
velocity deformation, lift/shadow springs, cancellation and Reduced Motion.
Draggable and animated are independent: animation may run without translation;
dragging remains available when animation is disabled. Interactive child controls
retain their own gestures. Elastic consumes the same optional Glass press helper.
Layout dimensions and transformed visual dimensions differ during deformation.
The source helper clamps the lens center to its parent bounds, allowing its edges
to extend beyond them; a caller can clip that overflow.

The Exact owner reconfigures motion only when its three flags change, releases
capture/listeners/springs on removal and restores original styles/priorities.
The optical owner remains alive across motion-only configuration updates.
Both primitive packages and the upstream SDK remain unchanged. This is an authored
material component; there is no corresponding headless primitive to extend.

The family remains Partial pending compiled browser behavior, geometry, lifecycle,
caller-style, optical/motion and native/device acceptance. A renderer accepting the
zoom parameter does not establish visible native WebKit magnification or optical
parity; those require separate rendered evidence.

## Verification

Chromium 156 and WebKit 27.2 pass real mouse dragging, source parent-center
bounds, animated/nonanimated and draggable/non-draggable combinations, sampled
velocity/scale/shadow updates, Reduced Motion, internal native button activation,
configuration changes without optical detachment, active removal and remount.
Synthetic pointer-cancel and window-blur fixtures verify the corresponding handler
paths; they do not qualify OS-level cancellation. Inactive motion owners leave
later caller styles untouched. Active owners restore inline values and priorities.
Eight captures cover 390/820px and light/dark, recording the 210×150 layout,
75px corners and zoom input. Representative Chromium narrow light and WebKit wide
dark captures were inspected. Animation changes transformed visual dimensions;
the source resting animated scale is distinct from its layout size.

A separate focused fixture verifies combined elastic/magnifier drag and cleanup
in both engines. Chromium additionally passes a continuous native browser touch
start/move/end sequence. Both engines pass a native mobile-browser child-button
tap. Continuous WebKit touch and physical devices remain unverified.

**Observed WebKit limitation:** the inspected consumer retains the native material
surface but does not provide the same visible background magnification/refraction
as Chromium. Supplying the 1.13 zoom token does not qualify optical output.
This component reuses the existing renderer; it does not resolve that backend gap
or establish a performance improvement.

The focused package suite passes 79 tests / 333 assertions and 143-file
typechecking. Affected lint/format and the full consumer build pass with the six
existing SDK warnings. Receipts: `.cache/acceptance/glass-magnifier-owner/` and
`glass-magnifier-elastic/`. Runtime/contracts/examples match the sealed consumer;
final docs, browser fixture refinements and test-command metadata postdate it.

The family remains Partial for the WebKit optical gap, initial motion/optics,
full inherited native/ref/render/event/caller styles, fusion/resize/preference and
pointer matrices, full reference motion/optics and physical/native-device coverage.
Both primitive packages, the shared glassMotion source and upstream SDK are
unchanged by this work. No landing or publication occurred.
