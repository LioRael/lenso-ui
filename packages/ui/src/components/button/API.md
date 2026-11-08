# Actions and navigation

These families use Lenso's component contracts and visual system.
Interaction props belong to Base UI or native HTML. Use `onClick`, `disabled`, `pressed`,
`onPressedChange`, `value`, `onValueChange`, `open`, and `onOpenChange` as
appropriate. There are no `onPress`, collection-key, compact-size, or
Button `"default"` compatibility props.

## Button

`Button` and `Button.Root` are the same native Base UI action component.
Use it in content areas with `prominent | bordered | borderless` (default bordered),
`sm | md | lg` (28/34/50px) and independent `destructive` / `tint`.
`GlassButton` is a separate export for navigation and floating controls, with
`default | prominent`, 28/34/50px text controls and a fixed 50×50 icon-only frame.
No old variants or material boolean remain on Button. Both retain native render,
state-dependent style callbacks, refs and loading activation guards. The Apple
layout and Web glass behavior follow the current component implementation.

## Groups and toolbar

`ButtonGroup` has native fieldset semantics. Its size, variant, orientation,
and full-width defaults apply to direct `Button` children, not controls
nested inside arbitrary wrappers. `ButtonGroup.Separator` goes inside the
following button. `ToggleButtonGroup` similarly scopes appearance to direct
`ToggleButton` children; Base UI owns its string-array selection, `multiple`,
disabled state, and keyboard navigation. `isDetached` restores individual
button rounding and removes separators.

`Toolbar` uses Base UI's roving-focus root. Its `Button`, `Link`, `Group`,
and `Separator` parts are styled Base UI parts. `Toolbar.Button` uses the
Button size and variant vocabulary, with the same primary default.

## Expansion and tabs

`Accordion` exposes `Item`, `Heading`, `Trigger`, `Indicator`, `Panel`, and
`Body`. `Disclosure` exposes `Heading`, `Trigger`, `Indicator`, `Content`,
and `Body`. Standalone disclosures use Base UI Collapsible. Inside
`DisclosureGroup`, `Disclosure` uses Base UI Accordion.Item: give it a native
`value`, and control the group's value array rather than individual `open`
props.

Base UI 1.7 owns expansion and measured panel geometry. A small native
keyboard layer supplies disclosure-group Arrow, Home, and End navigation
missing from that version. It honors prevented consumer events, skips disabled
triggers, and does not navigate into nested groups.

`Tabs.Indicator` is Base UI's single measured indicator. Place it inside
`Tabs.List`, as a sibling of the `Tabs.Tab` parts, not inside each tab as with
React Aria's SelectionIndicator. Tab and panel identities use `value`.
`Tabs.List` accepts Base UI's `activateOnFocus={false}` for manual activation.
`Tabs.ListContainer` adds the source overflow scroller and previous/next
controls; bare lists remain available.

## Native navigation

`Link` is a native anchor. `Breadcrumbs` renders a labelled navigation region
containing an ordered list; `Breadcrumbs.Item` renders a real anchor and
defaults the last direct item to the current page. `isCurrent` can override
that inference. `Pagination` renders native navigation, list, and anchor parts.
`Pagination.Link` uses `isActive` for `aria-current="page"`.

Disabled navigation removes `href`, retains link semantics with
`aria-disabled`, leaves the tab order, and suppresses activation. Unlike the
upstream React Aria pagination buttons, these links navigate to real URLs.
`Pagination.Previous` and `Pagination.Next` provide default text and decorative
icons; supply children and accessible labels to customize them.
