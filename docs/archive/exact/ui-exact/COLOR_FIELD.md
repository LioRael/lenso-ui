> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# ColorField and ColorInputGroup for Exact Web

These ordinary field components reuse the existing Lenso color-field and
color-input-group StyleX recipes. Their editable node is generated from the
canonical primitives-exact Input through the same guarded build-time bridge as
other fields. Color parsing, ranges and formatting use the shared pure Color model;
localized number parsing uses the existing NumberField parser. React hooks and
React controls are not imported.

## Public composition

`ColorFieldState` contains id, label, labelledBy, describedBy, value, channel,
colorSpace, locale, name, disabled, readOnly, required, invalid, variant and
fullWidth. Value is a color string accepted by the shared parser or an empty
string for no value. Channel is hex, hexa, red, green, blue, alpha, hue, saturation,
brightness or lightness. Numeric channels must belong to colorSpace (rgb, hsl,
hsb). Locale is an Intl locale; variant is primary or secondary.

`ColorField(state, change, commit)` owns the named field composition and hidden
request/form bridges. Compose ColorFieldLabel, ColorInputGroup and its Input,
Prefix and Suffix parts, plus explicit Description and Error content. Each
Input takes the same state and callbacks. Error takes id and message, and renders
an alert for a nonempty message. The application supplies invalid state and the
appropriate describedBy relationship; automatic validation-message policy is not
inferred from sibling content.

The [compiled consumer](example/color-field.contract) binds whole-color, RGB/HSL
channel and opacity fields plus a swatch to one Exact value. Change receives a
valid live color proposal. Commit receives the finalized value on Enter, blur or
a channel adjustment. Blank edits propose the empty string. Invalid drafts never
replace the application color and revert on commit or Escape. Parent rejection
restores the parent's value. Draft and caret remain local editing state; they are
not another owner of the selected color.

Hex/hexa fields accept optional-# short/long hex including alpha and emit a
canonical hexa key. Hex displays six RGB digits; hexa includes alpha. Numeric
channel changes emit rgba, hsla or hsba strings to retain their space and alpha.
Retain those values when achromatic hue must survive later edits; converting all
updates to RGB would discard that coordinate. ArrowUp/Down adjust a model step,
PageUp/Down a model page, and Home/End its endpoints. Typed channels clamp to their
range. Percent channels expose localized text and numeric accessibility values.

Named form bridges submit formatted hex or the numeric model value, rather than
posting the internal color string for each numeric field. Percent model values
are fractions. Disabled fields are excluded. For a native form present at
initialization, reset requests the mounted color for editable fields and restores
the controlled presentation. Prevented resets do not request a change.

## Initialization and lifecycle

The stock native Input is read-only until its color adapter initializes. At that
point the adapter formats the color/channel and respects the actual readOnly
state. Pre-initialization channel formatting, editing and canonical form output
are not accepted capabilities. This limitation is explicit; raw native text is
not counted as a complete interactive color field.

The adapter handles both Exact node updates and value/configuration mutations.
Theme or surface redraws retain formatted channel text and editing state.
Changing channel, color space or locale ends an incompatible draft. Removal
releases form/focus/input listeners, observers and pending frames, and restores
recorded native input attributes. Prefix/suffix pointer interaction focuses the
field without taking ownership of application actions.

## Verification and remaining work

Run from the repository root against an isolated compiled consumer:

```sh
EXACT_TEST_DIST=/absolute/compiled/dist bun packages/ui-exact/test/color-field-browser.mjs
```

PLAYWRIGHT_MODULE can select an installed Playwright module; evidence goes to
LENSO_EXACT_TEST_ARTIFACTS when provided. The driver verifies the loaded app script
fingerprint, then checks native editing, model/commit separation, keyboard
adjustment, configuration changes, controlled rejection, native form data/reset,
readonly/disabled suppression, localized percentages, redraw formatting,
removal/remount, and light/dark at 390/820 px. Touch contexts check native tap focus
followed by browser editing. Composition-event sequences are synthetic browser
fixtures, not evidence of a physical IME or software keyboard.

Both families remain Partial. Caller-style coverage, arbitrary native attribute,
ref/render/event forwarding, automatic validation integration, inherited color
context, pre-initialization value formatting and native/device adapters remain
open. ColorSlider is tracked in [COLOR_SLIDER.md](COLOR_SLIDER.md); ColorArea is tracked in [COLOR_AREA.md](COLOR_AREA.md). The
enclosing ColorPicker has separate acceptance gates.

[ColorPicker](COLOR_PICKER.md) now provides an explicit composed popover API;
automatic context and broader open-state/native APIs remain open.
