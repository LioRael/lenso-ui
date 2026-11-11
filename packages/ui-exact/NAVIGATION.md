# Navigation and separators

All declared props are required by Exact. These components use the shared Lenso
Link, Breadcrumbs and Separator StyleX recipes, including initial attribute
selectors. Their presentation is ordinary content navigation, with no glass
renderer or React dependency.

## Links

`Link(id, href, target, label, disabled)` accepts rich children. `id` supplies
the DOM and Exact test id, `label` is its accessible name, and `target` is an
explicit browsing context such as `_self` or `_blank`. A native anchor owns
navigation, context menus, copying the destination and modified activation.
No Exact action replaces browser navigation. `_blank` receives `noopener` from
Exact's host. Exact's own URL admission rules continue to apply.

`LinkArrow()` supplies the existing external-link arrow. `LinkIcon()` accepts
custom icon children. Both are decorative and hidden from the accessibility
name; put meaningful text in the link itself.

A disabled link has `aria-disabled=true`, no href and `tabindex=-1` directly
from Contract, including before the hatch loads. Once initialized, a removable
capture guard also cancels click, auxiliary click and Enter/Space events, so
synthetic activation does not reach ancestor actions. Enabling restores the
original declarative destination. This is a link, not an action button: use
`Button` for an in-page action rather than assigning a synthetic `href`.

## Breadcrumb composition

`BreadcrumbsState(id, label, disabled, direction)` describes a trail. Supply
`direction` as `ltr` or `rtl`. `Breadcrumbs(state)` exposes a named navigation
landmark with a list. `BreadcrumbsItem()` creates each list item. Place a
`BreadcrumbsLink` followed by its separator inside that item:

```text
use BreadcrumbsState, Breadcrumbs, BreadcrumbsItem, BreadcrumbsLink, BreadcrumbsChevron from "@lenso/ui-exact"

component Location
  derive trail = BreadcrumbsState(id="location", label="Breadcrumb", disabled=false, direction="ltr")
  view
    Breadcrumbs(state=trail)
      BreadcrumbsItem()
        BreadcrumbsLink(state=trail, id="location-home", href="/", target="_self", label="Home", current=false, disabled=false)
          text "Home"
        BreadcrumbsChevron()
      BreadcrumbsItem()
        BreadcrumbsLink(state=trail, id="location-settings", href="/settings", target="_self", label="Settings", current=true, disabled=false)
          text "Settings"
```

`BreadcrumbsLink` takes `state`, `id`, `href`, `target`, `label`, `current` and
`disabled`. Its slot is the link content. `current` supplies `aria-current=page`
and the shared current-link color; other items use `aria-current=false`. The
caller owns current-page identity, item order and separators. There is no
implicit “last child” selection or inspection of a slot's components. Leave
the separator off the last item; omit it after the current item when appropriate
for your hierarchy. Rich labels and separately composed separators remain
independent of the anchor hit area.

`BreadcrumbsChevron()` is the standard decorative chevron.
`BreadcrumbsSeparator()` accepts custom decorative children. Group and item
disabled states are combined. The list uses explicit ARIA list/listitem roles
because Exact does not expose native `ol`/`li` tags through these layout nodes.
Exact's CSS `direction` does not update HTML's `:dir()` state, so the trail's
explicit direction also drives the separator's transform before initialization.
No Web-only direction observer or second state owner is needed.

The source snippet above illustrates composition; the installed-consumer build
and browser tests execute [example/navigation.contract](example/navigation.contract).

## Separators

`Separator(id, orientation, variant, decorative)` takes `horizontal` or
`vertical` orientation and `default`, `secondary` or `tertiary` variant. A
semantic separator exposes its orientation with the `separator` role. A
decorative one has the `presentation` role and `aria-hidden=true`. It is never
a keyboard focus stop. Horizontal rules fill their container's width; vertical
rules stretch in a row with a minimum height of 8 px. The caller supplies the
surrounding layout.

## Verified scope

The compiled package consumer is checked in Chromium and Playwright WebKit:
click and Enter navigation, `_blank` context creation against a locally fulfilled
destination, disabled href removal before initialization, disabled synthetic
activation suppression, enabled Tab order, focus indication, dynamic current
page and group state, retained per-item disabling, separator geometry/variants,
RTL chevrons, reduced motion and hatch listener cleanup on removal. Screenshots
cover light/dark at 390 and 820 px and an RTL trail. The wider first-frame suite
compares the initial and initialized presentation and every registered recipe.
This does not establish physical-device Safari behavior or native Exact support.

The initialized hatch restores `role="link"` on disabled anchors: the pinned
Exact host omits the redundant authored role even after removing href. Guard
cleanup restores the previous role. Before the Web hatch starts, href and Tab
suppression work but the disabled link's explicit role is absent. This is an
open first-frame semantic boundary, also recorded by the Pagination checks.
