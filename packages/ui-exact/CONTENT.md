# Messages, badges, chips and close controls

These Exact Web components reuse the corresponding Lenso StyleX maps. Alert and
Badge include the existing medium/small glass material; Chip is an ordinary
label container. CloseButton uses native button semantics and an Exact action.
See the [compiled consumer](example/content.contract) for runnable composition.
Every declared prop is required by the current Exact compiler.

## Alert

`AlertState` has `id`, `status`, `role`, `label`, `labelledBy`, `describedBy`.
Statuses are `default`, `accent`, `success`, `warning`, `danger`. The caller
chooses semantics: the example uses `role="status"` for a saved-state message,
with title and description ID references. Use `role="alert"` only for an urgent
message. The component forwards the chosen role; it does not invent urgency.

`Alert(state)` accepts rich children and includes a decorative medium lens.
Compose `AlertIndicator(state)`, `AlertContent()`, `AlertTitle(state, id)` and
`AlertDescription(id)`. State is explicit on colored parts because Exact slots
keep the caller's lexical scope. `AlertDefaultIcon(status)` supplies the existing
decorative informational, success, warning or danger glyph; default and accent
use the informational glyph. Custom indicator children can replace it.

A dismiss control is optional. Compose `CloseButton` and let its action change
the application state. Alert does not own dismissal or choose a focus destination
when removed. The root uses border-box sizing; its content can shrink and wrap
unbroken text beside the fixed-size dismiss control on narrow screens.

## Badge

`BadgeState` has `id`, `label`, `size`, `color`, `variant`, `placement`:

| Field       | Values                                                 |
| ----------- | ------------------------------------------------------ |
| `size`      | `sm`, `md`, `lg`                                       |
| `color`     | `default`, `accent`, `success`, `warning`, `danger`    |
| `variant`   | `primary`, `secondary`, `soft`                         |
| `placement` | `top-left`, `top-right`, `bottom-left`, `bottom-right` |

Compose `BadgeAnchor(id)` around the anchor content and `Badge(state)`. Inside
the badge, `BadgeLabel()` adds label padding. Placements are physical corners,
matching the source recipes; changing text direction does not swap left/right.
The label container supports arbitrary content and the root includes a small
material lens.

The Exact root uses `role="img"` with the explicit accessible `label`, so a count
can be announced without making every change an unsolicited live announcement.
Update both visible count and label from the same application value; the example
uses `${count} unread messages`. The anchor's own button or link retains its own
accessible name and interaction. A Badge does not become an activation target.
An inline/unpositioned root is not a new placement variant; registered caller
styles can compose a different layout.

## Chip

`Chip(id, size, color, variant)` accepts rich content. Sizes are `sm`, `md`, `lg`,
colors match Badge, and variants are `primary`, `secondary`, `tertiary`, `soft`.
`ChipLabel()` adds the shared label padding. A chip is not inherently a button,
a toggle or an option. Compose a named CloseButton when removal is needed;
application actions own the value or collection update. The example demonstrates
a removable-label control without nested buttons or a glass surface.

The ordinary label recipe and registered caller StyleX maps are composed in the
same order as other Exact parts. The consumer applies a custom 8 px chip radius,
including before hatch initialization. Dynamic inline values retain the common
[styling boundary](STYLING.md).

## CloseButton

`CloseButton(id, label, press, disabled, loading, destructive)` supplies the
existing close glyph. `CloseButtonRoot` takes the same props and rich children;
`CloseButtonGlyph()` can be composed inside it. Supply a meaningful accessible
label for the action and target. The glyph is decorative.

The native button remains focusable while `loading=true`, exposes `aria-busy`
and `aria-disabled`, and its Exact activation action rejects repeated pointer,
keyboard and programmatic button clicks. A pending recipe suppresses active
scale feedback. `disabled=true` uses native disabled behavior. After loading
ends, the caller's same action becomes available. `destructive` composes the
shared destructive foreground and tracking recipes; size/variant/width remain
the source CloseButton's fixed visual geometry (24 px square).

The action does not automatically close a dialog, remove content or move focus.
That remains application behavior. The example counts activations independently
from a separate dismiss action, making loading and disabled checks observable.

## Material ownership and acceptance

The shared Exact material controller supports AlertDialog, Alert and Badge lens
nodes. Contract owns the nodes. The controller attaches medium/small optics,
observes contrast preferences and ancestors, restores prior opaque markers, and
cleans up media listeners, observers, timers and decorative optics on removal.
An enclosing native dialog controls activation/retirement of its material.
AlertDialog retains live-geometry optics; Alert and Badge use their source
components' ordinary geometry behavior.

Increased contrast, reduced transparency and forced colors use the same opaque
material fallback. A preference change restores the lens when appropriate.
Before the hatch loads, linked styles supply material fallback appearance;
full optics initialize with the hatch.

The installed browser suite exercises reactive colors/sizes/variants, accessible
relations, default/custom close content, keyboard/native activation, loading
focus retention and activation suppression, disabled/destructive states, all
badge corners, contrast/forced-color fallback, reduced motion, removal/remount,
unbroken-message wrapping and caller styles. Light/dark captures cover 390/820 px;
all generated recipe combinations are compared to their compiled class branches.

Glass optical acceptance requires a qualified capture backend; see
[VISUAL_CAPTURE.md](VISUAL_CAPTURE.md). Behavior and recipe comparisons do not
prove glass optical parity, live arbitrary-backdrop replay or device performance.
Alert and Badge retain that gate. CloseButton still shares open Button-family
work for focusable-disabled/render composition, ButtonGroup integration and
dynamic tint APIs. Native Exact adapters follow completion of the Web catalog.
