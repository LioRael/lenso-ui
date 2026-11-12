# ColorSlider for Exact Web

ColorSlider composes the canonical primitive range input, existing Exact Slider
pointer/keyboard behavior and shared ColorSlider StyleX recipes. Its thumb reuses
the existing spring/deformation adapter with the ordinary white-ring optical
part. It does not attach the ordinary Slider's Glass lens.

## Public composition

`ColorSliderState` contains id, label, value, channel, colorSpace, locale, name,
orientation, direction, disabled and readOnly. Value must be a nonempty supported
color string. Channel is a numeric channel in rgb, hsl or hsb; hex/hexa are text
field modes, not slider channels. Orientation is horizontal/vertical and direction
is ltr/rtl.

Compose `ColorSlider(state, change, commit)` with Label, Output, Track and Thumb.
The Label and Output take state; Track takes state and a slot. Thumb takes state,
change and commit. The [compiled consumer](example/color-slider.contract) binds
hue, opacity and red controls plus a swatch to one application color.

Change receives a complete rgba/hsla/hsba color proposal. Commit receives the
accepted complete color after a completed pointer or keyboard interaction.
The application retains the selected color; numeric DOM metadata is derived
presentation for the reused Slider controller. Parent rejection restores the
application value and suppresses an unaccepted commit.

The shared model supplies channel range, step, page step and localized value
text. Arrow/Home/End/Page navigation, Shift stepping and pointer capture use the
existing Slider adapter. The string protocol preserves the inclusive 360-degree
hue endpoint, so End stays at the end rather than jumping to zero. Gradients use
seven hue stops, a midpoint for lightness and endpoint colors for other channels.
RGB/saturation/brightness/lightness tracks use opaque display colors; alpha keeps
the checkerboard and transparency. Vertical values increase upwards; horizontal
RTL values increase leftwards.

Named native form bridges submit channel model numbers (for example hue 210,
RGB red 64 and alpha 0.5). These are slider model units; unlike a formatted
ColorField percentage input, saturation/lightness/brightness use their 0–100
channel range. A native form present at initialization supports editable reset
to the mounted color and excludes disabled values.

## Readiness and cleanup

The uninitialized native range is disabled with placeholder numeric bounds.
The Web adapter supplies the actual model bounds/value, gradient, position and
semantics before enabling it according to state. Pre-initialization color
interaction/gradient/form output is not accepted functionality.

Theme redraw retains channel output and the interactive input. Disabling,
changing geometry/configuration or removing an active control cancels its
interaction without a commit. Like the existing Exact Slider, cancellation
retains the last live controlled value. Removal releases behavior, motion,
observers, form handlers and pending frames and restores recorded native
attributes and inline styles. Remounting uses the retained application color.

## Verification and open gates

Run from the repository root against an isolated compiled output:

```sh
EXACT_TEST_DIST=/absolute/compiled/dist bun packages/ui-exact/test/color-slider-browser.mjs
```

PLAYWRIGHT_MODULE can select an installed browser module;
LENSO_EXACT_TEST_ARTIFACTS selects evidence storage. The driver verifies the actual
loaded script fingerprint. Chromium and WebKit cover keyboard focus continuity,
hue endpoints, completed pointer commits, RTL/vertical geometry, parent rejection,
read-only/disabled state, localized output, theme/width captures, active-gesture
removal, remount and native form/reset behavior. Touch contexts cover native taps;
Chromium additionally drives a native vertical touch sequence. WebKit trusted
continuous touch, physical devices and reference per-frame motion remain open.

This family remains Partial for the broader channel/variant matrix, custom
content/context and caller styles, arbitrary native attribute/ref/render/event
forwarding, pre-initialization rendering and native adapters. ColorArea is tracked in [COLOR_AREA.md](COLOR_AREA.md); the
enclosing ColorPicker has separate acceptance gates.

[ColorPicker](COLOR_PICKER.md) now provides an explicit composed popover API;
automatic context and broader open-state/native APIs remain open.
