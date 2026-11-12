> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# ColorArea for Exact Web

ColorArea composes two canonical primitive-derived native ranges with the shared
Lenso ColorArea/Slider StyleX recipes. The pure gradient model retains the existing
React Aria adaptation. The thumb reuses Slider spring deformation without a
Glass refraction lens.

## Public composition

`ColorAreaState` contains id, label, value, colorSpace, xChannel, yChannel, locale,
direction, xName, yName, disabled, readOnly and showDots. Value must be a nonempty
supported color string. Use distinct numeric axes from rgb, hsl or hsb; alpha
is preserved but cannot be an area axis. Direction is ltr/rtl.

Compose `ColorArea(state, change, commit)` with `ColorAreaThumb(state, change,
commit)` inside its slot. See the [compiled consumer](example/color-area.contract).
The application owns the color. Change proposes one complete rgba/hsla/hsba color
for both coordinates, preserving the third channel and alpha. Commit receives
the accepted complete color when a keyboard or pointer interaction finishes;
parent rejection restores the application value and suppresses the commit.

The primary range supports horizontal arrows for X and vertical arrows for Y.
Tab reaches the secondary Y range. Home/End use the focused axis; Page and Shift
use model page steps. Horizontal direction follows RTL; Y increases upwards.
Localized accessible channel names and values derive from the pure color model.
Both native ranges remain available to assistive technology. The opaque thumb
face depicts the color independently of its retained alpha.

Pointer cancellation and window blur restore the starting color without a commit.
Changing configuration or disabling an active gesture also requests rollback;
the internal rollback action can therefore notify the parent after disabled or
readOnly changes. The parent can reject that proposal. Removal retains the last
live controlled value without committing. Cleanup releases capture, listeners,
observers, spring motion and pending frames and restores recorded attributes and
inline styles. Remounting uses the retained application value.

Named form bridges submit numeric X/Y model coordinates. A native form present
before initialization supports editable reset and excludes disabled values.
The two native ranges are initially disabled with placeholder bounds; gradients,
coordinates, names and numeric form output require the Web adapter.

## Verification and open gates

```sh
EXACT_TEST_DIST=/absolute/compiled/dist bun packages/ui-exact/test/color-area-browser.mjs
```

PLAYWRIGHT_MODULE selects an installed browser module and
LENSO_EXACT_TEST_ARTIFACTS selects evidence storage. The driver validates the actual
loaded script fingerprint. Focused checks cover dual-axis keyboard operation,
atomic pointer updates, RTL, RGB/HSL/HSB switching, controlled rejection,
read-only/disabled state, dots, theme redraw and active removal/remount. Cancellation
uses a synthetic pointercancel during a native mouse capture. Native form/reset
and browser touch fixtures are separate checks in the same driver.

This family remains Partial. Full axis/locale/caller-style and custom-content
coverage, source reference geometry and per-frame motion, pre-initialization
rendering, arbitrary native attribute/ref/render/event forwarding, physical
devices and native adapters remain open. WebKit trusted continuous touch remains
unverified; its browser fixture covers native taps. ColorPicker has separate acceptance gates.

[ColorPicker](COLOR_PICKER.md) now provides an explicit composed popover API;
automatic context and broader open-state/native APIs remain open.
