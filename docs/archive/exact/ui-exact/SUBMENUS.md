> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Exact Web submenus

MenuSubmenuRoot, MenuSubmenuPositioner, MenuSubmenuTrigger,
MenuItemSubmenuIndicator, MenuSubmenuHeading and MenuSubmenuBody extend Menu's
native top-layer tree. Upstream Exact remains unchanged. Menu still has open
modal/morph, native forwarding and optical/motion/device gates.

## Authoring

Give every positioner a unique MenuState/id. Put each child positioner inside its
parent MenuPositioner, beside the parent's MenuPopup. Its trigger stays in the
parent's popup and targets the child id. Put grandchildren beside the child popup,
inside the child positioner. This retains the authored Exact nodes and native
popover ancestry while allowing the parent content to become inert independently.
A stacked child authored inside the parent's popup is rejected because native
popovers cannot escape inherited inertness.

MenuSubmenuRoot is a display-contents wrapper. MenuSubmenuPositioner accepts
MenuState and presentation=auto/cascade/stacked. The source auto breakpoint is
768px. Cascade uses the authored side/alignment/offsets; the example chooses
inline-end/start with an 8px gap and -10px alignment offset. Stacked mode anchors
to the parent popup, bottom/start, using the source overlap:
`-min(parentHeight * 0.62, childHeight + 8)`. Floating UI retains collision
avoidance and open-only anchor tracking. Window mode changes reposition the
existing child without replacing its nodes.

MenuSubmenuHeading is a native back item targeting its own child id. It appears
in stacked mode and hides in cascade mode. Supply its title explicitly, using the
same rich content as the trigger. MenuSubmenuBody composes the child items.

## Input and focus

Submenu triggers use menu-item presentation, disabled behavior and explicit
aria-haspopup/controls/expanded state. Their openOnHover string is auto, true or
false. Auto enables mouse hover for cascade mode and disables it for stacked
mode, matching the source defaults. The source rest delay is 100ms and close
delay is zero; meaningful pointer movement restarts rest, small jitter does not.
Touch/pen do not create mouse hover previews. Native pointer focus remains owned
by Exact; hover opening preserves the parent trigger's focus. The shared safe
polygon protects travel toward the child, including its rectangular gap. Open
children protect their ancestors during traversal.

Source submenu mouse activation in hover mode preserves the hover-open panel;
keyboard/touch activation toggles it. After hatch, the adapter uses idempotent show/hide commands so Exact's deferred
menu-row action cannot toggle a child twice. Native invoker association remains
intact for light dismissal. Authored command attributes restore on teardown. Forward arrows open
and focus a child; back arrows close one level, both following directionality.
Escape dismisses the top native popover. The back heading also closes one level.
A leaf action closes the whole tree; closeOnClick=false retains its checked-value
editing path. Tab exits the whole tree relative to the outer trigger.

## Parent ownership and remaining motion

Open children retain a parent count. Stacked children retain the source settled
parent pose: surface/content scale 0.96 and content opacity 0.45, with the parent
content inert and its popup hidden from accessibility. Child positioners remain
interactive siblings. The final child release restores the exact authored styles
and attributes; sibling/nested children have separate leases. Cascade parents
retain ordinary interaction. Pending hover work, pointer corridors, media queries,
listeners and parent leases are released on closing/removal.

These are interaction/layout and settled-pose contracts. The source shared-title
and surface spring transitions, cascading reveal clip, reversal/exit choreography,
elastic feedback, source focus-guard/screen-reader parity and qualified optical
or per-frame reference acceptance remain open. Endpoint screenshots and passing
keyboard checks do not establish those motion or physical-device gates. Native
platform adapters follow completion of Exact Web. Before hatch, native menu
markup works; this adapter's layout modes and full submenu interaction start at
initialization.

See the compiled [submenu example](example/menu-submenu.contract) for sibling
positioner composition, three levels, two sibling branches, directions, explicit
presentation modes, disabled updates and pending-removal controls.
