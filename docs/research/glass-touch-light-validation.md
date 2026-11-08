# Touch-centered glass press light

Apple's [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)
explains that interaction light starts beneath the fingertips, spreads throughout
the element and onto nearby Liquid Glass. Apple does not publish the falloff
function. The Web implementation below follows that behavior; it is not a claim
of native pixel or timing identity.

## Implementation

The held pointer owns a light position independently of elastic movement. A
window-level primary-pointer gesture keeps tracking across item boundaries and
cleans up on release, cancellation, blur and unmount. The position is measured
against the current presentation bounds while held, so elastic scaling does not
pull the light away from the input. Keyboard interaction uses the focused
control's center. No activation event, capture, focus or selection is replaced.

The bright fill uses a radial falloff instead of a uniformly filled item and a
weak moving secondary spot. The radius is three times the shorter presentation
dimension, with a 100px minimum. Opacity falls through 1, .88 at 35%, .45 at 65%
and zero at the radius. These are Web tuning values, not Apple specifications.
Small buttons receive broad coverage; longer surfaces retain a visible gradient.

Matching fused members composite this same field once over their shared outline.
The originating item remains the gesture owner when the pointer crosses another
item, without recentering or retriggering its light. Ordinary Toolbar.Group and
attached Toolbar surfaces have their own single decorative light. Nested optical
surfaces do not illuminate an enclosing surface a second time. Shared toolbar
members and fused controls suppress their separate hover/focus fills, while
retaining focus outlines. Labels adapt to illumination at their centers so a
neighbor's light does not wash out dark-theme text. Prominent controls retain
their own label recipe. Existing edges and material handoff are retained.

No public prop or migration is required. `elastic={false}` controls motion and
does not disable lighting. GlassButton and GlassToggleButton share the light
layer. Forced-colors suppression remains in the existing material styles.

## Evidence

| Surface                                  | Artifact / observation                                                                                                        | Result              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Docs detachable group, dark              | Held Decrease dragged over Increase; shared light center moves, Decrease returns to light text and Increase becomes dark text | Observed in browser |
| Docs detachable group, light             | One radial field spans both members at the held position                                                                      | Observed in browser |
| Independent GlassButton with elastic off | Moving pointer updated light x to 72.55%; computed scale remained 1; highlight opacity 1                                      | Observed in browser |
| Ordinary glass group, production fixture | Copy gesture dragged over Paste; group owns light, x 57.05%, opacity 1                                                        | Observed in browser |
| Attached toolbar, production fixture     | One surface light; no extra individual capsule fills; computed scale 1 with elastic off                                       | Observed in browser |
| Docs separation and rejoin               | Actions remain available; ArrowRight moves focus from Decrease to Increase                                                    | Observed in browser |

Browser artifacts are saved in the session visualization directory under
`press-light/`: `toolbar-light.jpg`, `toolbar-dark-final.jpg`, `button-stationary.jpg`,
`attached-toolbar.jpg`, and `ordinary-group.jpg`. The temporary production fixture
uses built workspace packages, compiled StyleX and the existing material recipe.
The documentation checks use the maintained `bun run dev:docs` preview.

Four new DOM tests catch pointer tracking lost outside an item, ignored pointer
identity/cancellation, disabled descendant activation, keyboard location/cleanup,
and duplicate parent lighting for a nested optical control. Existing DOM tests
do not cover these gesture ownership failures. Nine affected DOM tests and thirteen
glass tests pass. Affected format/lint, glass/UI type checks, package build and
installed-consumer production checks pass. DOM tests do not prove pixels.

Native iOS touch/device acceptance and a second browser engine were not run in
this pass. The in-app browser does not support touch event dispatch; touch was
not represented as a real-device check. The general Toolbar documentation route
reports `state is not defined`, so ordinary/attached toolbar rendering was checked
in the production fixture instead. Contract regeneration is separately blocked by
an existing additional `surface/group.styles.ts`: the generator expects one style
map source per family and finds two. Neither unrelated area was changed.

## Scoped delivery gate

- Hard Gate PASS: affected native actions and ArrowRight focus were exercised;
  disabled/cancel/blur cleanup and nested ownership have regression tests. No new
  content flow, asset, claim or navigation was introduced. Coverage limits above
  remain explicit rather than being counted as acceptance.
- Purpose Gate PASS: the gradient represents distance from the input, and the
  shared field removes item boundaries from material feedback. It is not an
  unrelated decorative glow.
- Liveliness PASS: existing ENERGY 1 / RHYTHM 1 / MOTION 2 is retained. Input
  tracking communicates direct manipulation without adding layout animation.
- Craftsmanship PASS: rendered ordinary, attached and detachable surfaces were
  checked, including neighboring label contrast and disabled controls. The
  original material and exterior contour were retained.
