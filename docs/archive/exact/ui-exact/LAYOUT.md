> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Cards and empty states for Exact Web

Card and EmptyState reuse the corresponding Lenso StyleX maps and preserve
Exact ownership of their children and actions. The [compiled example](example/layout.contract)
shows a document card moving from an empty state to real content.
Every declared prop is required by the pinned Exact compiler.

## Card composition

`CardState` contains `id`, `variant`, `role`, `label`, `labelledBy`, `describedBy`.
The caller chooses semantics and label relations; the example names a `region`
with its title and description. Supported variants are `default`, `secondary`,
`tertiary`, `transparent`, `glass`.

Compose:

- `Card(state)` with `CardHeader()`, `CardContent()` and `CardFooter()`.
- `CardTitle(id, level)` and `CardDescription(id)` inside the header.
- Existing Link/Button components in content and footer; the Card itself is not
  an implicit activation target.

All parts accept rich children. The ordinary variants use the source backgrounds,
spacing and shadow. Only `glass` creates a decorative medium-material lens.
The initialized native bridge also reflects `data-material="glass-medium"` only
on the glass variant; ordinary variants remove that marker. Variant changes add/remove that Contract-owned node, rather than retaining optics
on an ordinary surface. The shared material controller handles contrast fallback
and disposal, including when the card is inside a native dialog.

The title uses Exact's text heading role/level. A static level emits a native
heading through the existing compiler; changing a heading's level does not
require replacing an Exact-owned node from the hatch. Description content uses
a Contract box with the paragraph role; this adapter does not claim a native paragraph tag.
Border-box sizing, zero heading margins and wrapping bounds adapt the source
geometry to Exact's raw content-box and heading defaults.

## EmptyState composition

`EmptyState(id, label, labelledBy, describedBy)` is a named region and accepts
children. Its parts are `EmptyStateContent()`, `EmptyStateIcon(variant)`,
`EmptyStateMessage()`, `EmptyStateTitle(id, level)`,
`EmptyStateDescription(id)` and `EmptyStateActions()`.

Icon variants are `symbol` (49 px) and `circle` (50 px). Icon children are
caller-owned and decorative; the example supplies an actual SVG document shape.
Title/description supply the accessible message, and actions use the existing
Button component. EmptyState does not own loading, document creation, retries or
collection state. The example's Exact action creates content and replaces the
empty state; reset returns it to the empty state. Creation moves focus to the new document
link through an Exact action.

The example registers caller StyleX widths of 100% for both action buttons; the
Button recipe normally uses fit-content. Its card title also demonstrates a
registered 600 weight override, before and after initialization.

The source recipe sets centered content, a full-width message, column actions
and narrow-screen wrapping. Registered caller StyleX maps compose last, using
part kinds and stable IDs where exposed. EmptyState remains an ordinary surface;
it does not introduce an independent glass layer.

## Verification and remaining gates

The consumer checks all five Card variants, conditional lens creation/disposal,
accessible region names/descriptions, heading levels, real button actions and
link navigation, both icon geometries, empty-to-content/reset transitions,
contrast/forced-color fallback, long unbroken labels, narrow/desktop and RTL
layouts. Initial linked styles and caller overrides are checked before/after
hatching. The full browser suite compares all registered recipes with their
compiled class branches.

Card's glass optical/device gate remains open; a Playwright screenshot can omit
actual WebKit backdrop blur (VISUAL_CAPTURE.md). Functional activation/disposal
and recipe equality do not prove optical parity or device performance. Prose's
native paragraph/code support and Kbd's native element surface remain separate
upstream gaps, retained by owner choice in [SEMANTIC_GAPS.md](SEMANTIC_GAPS.md).

The current Chromium/WebKit receipt records native `h3` elements for both
example titles. That proves the supported heading path for this consumer; it
does not close the separate paragraph/code/keyboard declaration gaps.
