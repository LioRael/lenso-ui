# SegmentedControl and SectionIndex

These additive components are available from `@lenso/ui` and the corresponding
`@lenso/ui/segmented-control` and `@lenso/ui/section-index` subpaths. Existing
value and callback contracts are retained. Their StyleX maps are exported from the matching
`@lenso/tokens` subpaths. Primitive component sources are unchanged.

## SegmentedControl

Supply `items` with unique string `value`, visible `label` and optional disabled
state. Provide a group name through `aria-label` or `aria-labelledby`. Use
`defaultValue` for uncontrolled selection or `value`/`onValueChange` for controlled
selection. No value is selected by default. Unknown values also select nothing.
Base UI's native change details, cancellation, radio keyboard behavior, refs,
render composition, validation, `readOnly`, `disabled`, `name` and `form` remain
available. Form reset restores the uncontrolled default; a canceled reset leaves
selection unchanged. Controlled owners manage their own reset.

Appearance and motion now share Tabs' implementation: capsule track, selected
paint, typography, sliding/held lens, label refraction and elastic feedback.
`size="sm"` defaults to 28px-high segments; `size="lg"` uses 46px. Layouts that
assumed the initial 44px segment height should choose `lg` or adjust their space.
Short labels truncate when constrained; their complete accessible names remain.
`glass=false`, `elastic=true` and `lift=20` match Tabs' defaults. Set `glass` for
the same floating material, `elastic=false` to disable track deformation, or
adjust `lift` for both controls consistently. Reduced-motion presentation uses
the existing shared spring policy. `emptyLabel` defaults to “No options” and can
be localized.

Base UI still owns radio selection and forms; no tab/panel roles are introduced.
Dragging decorates the lens and activates an enabled radio at release. Canceled,
disabled, read-only or rejected changes preserve the accepted value. Use Tabs
when choices switch associated content panels; use SegmentedControl for a filter
or a submitted value. The docs Story includes a synchronized comparison example.

## SectionIndex

Supply `items` with unique `value`, short `label` and `href` typed as a same-page
fragment. Every fragment must point to an existing section heading. Duplicate
IDs, scroll-spy synchronization and the containing list are application-owned.
The docs Story supplies a runnable, uniquely identified example.

Native links navigate on click or Enter. Up/Down and Home/End move focus without
navigating and skip disabled entries. Tab leaves the index according to the
browser's tab order. Touch/mouse scrubbing activates the nearest enabled link;
only the narrow index strip claims touch gestures. The surrounding list remains
natively scrollable. Native link dragging is disabled so it cannot cancel a scrub.

`onValueChange` reports link activation; controlled `value` changes only the
current-location marker. Rejecting that callback does not cancel native link
navigation. Use a root capture handler to cancel navigation when required.
Modified clicks preserve their native behavior. `defaultValue` initializes the
uncontrolled marker. Disabled entries retain link names but cannot be activated;
empty collections render no links. Label the nav and place it beside the list,
typically sticky within the same scroll container.

## Reference and verification

The selection model was reviewed against
[upstream SegmentedControl](https://github.com/onlymoein/liquidglass/blob/d93c8634e67a64c1bd4d1d75cd333905fe567687/src/segmented-control.tsx)
and Apple's [segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls).
SectionIndex follows the purpose of UIKit's
[section index titles](<https://developer.apple.com/documentation/uikit/uitableviewdatasource/sectionindextitles(for:)>).
These are Web implementations using Lenso contracts, not native rendering or
physics parity claims. The shared Tabs presentation retains its existing
adaptation notices; unification does not vendor a separate upstream implementation.

Browser and packaging results are recorded in
[the validation report](../research/segmented-section-validation-2026-11-09.md).
