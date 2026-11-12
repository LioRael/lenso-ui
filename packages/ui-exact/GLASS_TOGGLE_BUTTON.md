# GlassToggleButton for Exact Web

GlassToggleButton derives its actual native button, controlled boolean inversion
and disabled activation from `@lenso/primitives-exact` Toggle. The generated
projection preserves the MIT license and canonical source fingerprint. No primitive
package or upstream SDK change is required. The ordinary ToggleButton remains an
ordinary control; GlassToggleButton is the explicit floating-material alternative.

`GlassToggleButton(id, label, pressed, change, disabled, size, variant, iconOnly,
fullWidth, tint, elastic)` accepts rich children. `change` proposes a boolean; the
application owns `pressed` and may reject the proposal. Sizes are sm/md/lg and
variants default/prominent. An empty tint uses the theme. Icon-only content still
needs a nonempty accessible label. `GlassToggleButtonIcon()` provides the shared
Glass icon geometry. The native button retains Enter, Space and disabled behavior.

`GlassToggleButtonGroupItem(state, id, value, label, disabled, iconOnly, tint,
elastic, change)` composes the existing ToggleButtonGroupState and group, including
single/multiple selection, joined/detached, horizontal/vertical, full width and
looping roving focus. The group variant maps prominent to prominent and other
ordinary variants to default, as in the source component. Pass tint explicitly;
there is no implicit React context. Ordinary and Glass items share selection and
keyboard ownership. Joined Glass items suppress independent elastic deformation.

Presentation reuses shared GlassButton, ToggleButton and GlassToggleButton token
recipes. Persistent selection uses aria-pressed; Exact's transient data-pressed
marker retains pointer-feedback ownership. Shared optics stay attached across
selection-only redraws and release on disabled state or removal. Tint restores and elastic resources release when the hatch ends. Reduced motion and forced-color material
fallback follow the existing Glass/motion implementation.

The compiled root example supplies standalone, icon-only, mixed grouped items,
controlled rejection, disabled state, sizes, variants, tint and lifecycle controls.
The family remains Partial until its browser, caller-style, optics/motion and
native/device gates are qualified; implementation alone is not full acceptance.

## Verification

The stock Exact consumer passes in Chromium 156 and WebKit 27.2: native Enter/
Space, coupled icon/label state, rejected updates, mixed ordinary/Glass multiple
selection, disabled skipping, looping/RTL/vertical focus, tint, disabled optical
release/re-enable, elastic pointer input, removal/restoration, full width, detached
state and forced colors. Both pass native mobile-browser taps and the existing
ordinary Toggle regression. A selection-only redraw fixture verifies that the
optical owner is not detached; it does not claim filter content stays unchanged.

Forty-eight captures cover two engines, two widths, two themes, both variants and
all three sizes, with native height and icon-width assertions. Representative
Chromium narrow prominent and WebKit desktop dark captures were inspected.
Two blocked-hatch captures verify initial size and persistent selected appearance;
activation is checked only after the adapter resumes. The tint's runtime native
style arrives after initialization. The WebKit route uses native blur; these
checks do not qualify optical or continuous-motion equivalence to Chromium.

The suite passes 77 tests / 323 assertions, typechecking covers 135 files, and
affected formatting/lint plus the full consumer build pass (six existing SDK
warnings). Receipts: `.cache/acceptance/glass-toggle-tint/` and
`glass-toggle-initial/`. Earlier cohorts retain the observed disabled-lifetime and
missing native prominent-tint metadata findings. The primitive packages remain
unchanged. Initial interaction/tint, full single-selection/group/variant behavior,
automatic context, broad callback/ref/render/native props, caller-style matrices,
fusion-specific release motion, optical parity and physical/native-device coverage
remain open. These scoped checks do not complete the full catalog.
