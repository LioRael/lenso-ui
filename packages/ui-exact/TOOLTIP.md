# Tooltip for Exact Web

Tooltip supplies supplementary descriptions without moving focus or replacing the
trigger action. Use Popover for a dialog or editing task. Exact owns the trigger
button and its `press` action; the adapter owns hover/focus timing, description
association and native manual-popover presence. Upstream Exact stays unchanged.

## Composition

The parts are TooltipProvider, Tooltip, TooltipTrigger, TooltipPortal,
TooltipPositioner, TooltipPopup, TooltipArrow and TooltipViewport. Every Contract
prop is explicit. Positioner and Popup share a TooltipState; Popup's id is
`${state.id}-popup`. Trigger's target is the Positioner id. Trigger renders a native
button with rich content and an action. Its disabled prop disables the tooltip,
keeping the underlying button action available, as in the source Tooltip contract.
Native disabled buttons and aria-disabled buttons do not open descriptions.

Root, Provider and Portal are display-contents wrappers. The native manual top
layer preserves ancestry, theme and provider inheritance. Custom portal
containers, polymorphic trigger rendering and arbitrary native event/ref forwarding
remain outside this adapter's current API. Before hatching, linked styles and
native programmatic presence work; hover/focus behavior starts at initialization.

## Timing and input

Trigger delay/closeDelay override the nearest Provider, then its parent providers,
then inherited `--lenso-tooltip-delay` and `--lenso-tooltip-close-delay`. Use -1 for
inheritance. Source fallbacks are 1500ms open and 500ms close. Provider timeout
uses the source 400ms default. Opening a group member immediately transfers active
presence from the previous member; subsequent members skip the open delay while
the group is active and during its timeout after closing. Groups are scoped to
the closest Provider, with timing inheritance through nested Providers.

Mouse/pen entry schedules opening. Early exit, disabling and removal cancel it.
Keyboard-visible focus opens immediately. Pointer focus and touch do not create
focus previews. Escape, outside press and focus leaving dismiss the description;
focus stays where the user placed it. closeOnClick defaults to true in the source:
closing never prevents the Exact action. Set false to keep a hover description
through a trigger click. Dismissal blocks reopening until a real exit/re-entry or
new keyboard focus event.

A hoverable popup keeps the shared gap and pointer path available through the
Base UI/Floating UI safe polygon, with the source 40ms polygon timeout and cursor
speed/buffer rules. disableHoverablePopup opts out. No page pointer shielding is
installed. Closed/exiting descriptions are inert and hidden from accessibility.
An open description appends its id to the active trigger's aria-describedby and
retains authored ids; closing and teardown restore them. It adds neither dialog
semantics nor expanded/haspopup state and never automatically focuses content.

## Placement and presentation

Floating UI DOM 1.8.0 supplies fixed placement, collision flip/shift, available
space, arrow positioning and open-only anchor tracking. State supports six
physical/logical sides, three alignments, RTL, offsets, collision padding,
collision avoidance and tracking opt-out. sideOffset=-1 chooses the source's
arrow-aware default: 7px with an arrow and 3px without one. This sentinel means
negative explicit offsets are currently an API gap. The source transform origin,
entry/exit states, Reduced Motion and caller static StyleX composition are retained.

Presentation reuses tooltipStyles and the source thick anchored material. Its
12px arrow and panel share one mask/backdrop sample. Description text uses 12px
font size, 8px padding and a 320px maximum width constrained to available space.
Opaque contrast/transparency and forced-color preferences remove decorative
paints. Timers, tracking, pointer corridors, observers, attributes and inline
coordinates are released/restored on teardown. Reapplying hatches retains the
current native session and focus.

## Focused acceptance

The focused Chromium 156.0.8078.4 and Playwright WebKit 27.2 cohort checks 48
affected recipe comparisons and 36 physical/logical-side, alignment and direction
endpoints. Blocked-hatch checks verify native tooltip semantics, linked 8px
padding/12px text and no focus movement. Interaction checks cover source default
delays, provider/CSS/trigger timing, grouped opening, keyboard-visible focus,
Escape, underlying actions, disabled tooltips, optional arrows, active/inactive
trigger lifecycle, pending removal, corridor cleanup and hatch reapplication.
Captures cover light/dark at 390/820px. Touch activation is emulated and verifies
that the action runs without a tooltip or automatic editor focus. These are
focused checks rather than a rerun of the entire catalog.

## Remaining work

The family remains Partial. Controlled open state/reasons/payloads, handles, cursor tracking,
viewport transitions, custom arrows/portals, negative explicit offsets and full
native render/ref/event forwarding remain open. Native-platform adapters,
qualified optical/per-frame/device acceptance and comparative performance remain
separate. Playwright WebKit's known backdrop screenshot limitation still applies;
a screenshot without captured blur does not prove a material or performance fix.
