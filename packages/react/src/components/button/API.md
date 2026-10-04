# Actions and navigation

These families reconstruct HeroUI v3.2.6 at commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`. Interaction props belong to Base UI
1.7 or native HTML, not React Aria. Use `onClick`, `disabled`, `pressed`,
`onPressedChange`, `value`, `onValueChange`, `open`, and `onOpenChange` as
appropriate. There are no `onPress`, collection-key, compact-size, or
Button `"default"` compatibility props.

## Button

`Button` and `Button.Root` are the same callable component. Sizes are `"sm"`,
`"md"` (default), and `"lg"`. Variants are `"primary"` (default),
`"secondary"`, `"tertiary"`, `"ghost"`, `"outline"`, `"danger"`, and
`"danger-soft"`.

```tsx
<Button variant="secondary" onClick={save}>
  <Button.Icon>
    <SaveIcon />
  </Button.Icon>
  Save
</Button>
```

`Button.Icon` is an explicit decorative-icon boundary. It supplies the source
SVG viewport dimensions and hides the wrapper from assistive technology. It
does not inspect paths, infer whether arbitrary SVG content is decorative, or
rewrite SVG internals. Custom SVG components must forward `width` and `height`.
An SVG outside this part keeps its own semantics and sizing. The same part is
available as `ToggleButton.Icon`; it also works inside `Toolbar.Button`.
For `isIconOnly`, give the control an accessible name with `aria-label` or
`aria-labelledby`.

`isLoading` retains the rendered content, accessible name, DOM node, and focus.
It announces `aria-busy`, blocks pointer and Enter/Space activation, and guards
both a render element's capture handlers and a render function's returned
element. It does not set native `disabled`. Compose any progress indicator
without replacing the action's name. Explicit `disabled` retains Base UI's
separate `focusableWhenDisabled` behavior.

`ref`, `render`, and Base UI's state-based `style` callback are forwarded.
`xstyle` comes after the family, size, variant, and group styles inside Button's
StyleX composition. Concrete native parts forward the complete compiled result,
including dynamic StyleX variables. A runtime `style` callback may still
override inline geometry.

When another native part renders a Button, Button preserves the part's injected
classes, styles, events and refs using Base UI's prop composition. Its public API
still does not accept `className`.

Class preservation is not property-level StyleX merging across two components.
Avoid defining conflicting appearance overrides on both a styled trigger and
its rendered Button: their classes meet through normal CSS, and runtime variable
names may also overlap. For deterministic geometry, render a native element,
style an outer layout wrapper, or use the native inline `style` boundary.
The `xstyle`-last rule applies to each component's own compiled style objects,
not to opaque classes injected by another component.

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
