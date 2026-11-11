# Pagination for Exact Web

Pagination is ordinary document navigation. It reuses the source Pagination and
Link StyleX maps and keeps native anchors, href/target behavior and focus. It does
not add Glass, page-range generation or an internal selected-page owner.

`PaginationState` contains id, label, size (sm/md/lg), direction (ltr/rtl) and
disabled. `Pagination(state)` exposes a named navigation landmark. Summary takes
state and rich content. Content/Item expose list/listitem roles. The pinned Exact
composition uses boxes for these structures; it does not claim native nav/ul/li
HTML tags. Direction is explicit because Exact's CSS direction does not set HTML
`:dir()`; both stock chevrons follow the explicit pagination direction.

`PaginationLink(state, id, href, target, label, current, disabled)` accepts caller
content. Only the owner's current item gets aria-current=page and active styling.
Previous/Next take the same props except current, retaining rich content; fill
those slots with PreviousIcon/NextIcon and localized visible text, or provide your
own content. Ellipsis takes state and decorative content, normally `…`.
Summary uses the reserved root-id `-summary` suffix. Give every link a unique id.

All props and content are explicit, including accessible labels. Pass the same
state to size-aware parts. The source's inherited context becomes an explicit
Exact state shape, keeping caller slots and application state ownership intact.
An application or router supplies destinations, current page, available pages
and summary; navigation does not automatically rewrite current. The example's
Current page control demonstrates accepted owner updates independently of native
hash navigation.

Disabled links have no href and use tabindex=-1 before the hatch starts. Native
capture guards also suppress synthetic click/auxclick/Enter/Space activation
after initialization. Exact drops the redundant authored role on anchors even
when href is absent. The initialized hatch restores role=link on disabled
anchors; that role is still absent before hatch, an explicit upstream boundary.
Individual and group disabled flags compose. Enabled links
retain normal Tab/Enter, modifier and target semantics; the component does not
turn the list into a roving-tab widget. Guard listeners are released on disposal.

The shared styles cover all three sizes, responsive touch/desktop dimensions,
summary type, nav padding, selected/hover/focus/press, and Reduced Motion. Root
layout switches from column to row at 640px; link dimensions change at 768px.
Registered caller StyleX maps compose last and are delivered before the Web hatch.

## Acceptance

Chromium 156.0.8078.4 and Playwright WebKit 27.2 pass the compiled consumer,
34 affected metadata/class recipe comparisons, blocked-hatch style parity,
native hash click/Enter navigation, Space non-activation, a noopener new tab,
enabled Tab order and focus, dynamic current/group/item disabling, press scale,
Reduced Motion, retained nodes and listener/role cleanup. Existing Link and
Breadcrumbs navigation regressions pass alongside this family. Geometry and
inspected screenshots cover sm/md/lg, LTR/RTL, light/dark and 390/820px, with
explicit direction also tested against the opposite HTML document direction.

Blocking-hatch receipts separately record the disabled anchor's role before
and after initialization. Its missing pre-hatch role remains a known gap.
The family remains Partial. Full ref/render/native-event forwarding,
native HTML structural tags, native-platform and physical-device acceptance
remain open. This is not a rendering-performance comparison.
