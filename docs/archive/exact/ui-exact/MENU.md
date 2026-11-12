> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Menu for Exact Web

Menu currently provides a non-modal anchored action menu. Exact owns buttons,
links, actions and checked values; HTML owns native auto-popover presence, Escape
and light dismissal. Exact's native menu navigation supplies arrow-key wrapping,
Home/End, disabled-item skipping and pointer focus. The Web adapter adds anchor
geometry, first/last-item opening, typeahead, Tab exit and lifecycle ownership.
Upstream Exact remains unchanged. This family is Partial; source morph/elastic, modal and advanced submenu
behavior are still required for completion. See [Submenus](SUBMENUS.md) for
cascade/stacked composition and its motion boundaries.

## Composition

MenuState declares id, accessible label/labelledBy, side, alignment, direction,
offsets, collision padding/avoidance and tracking opt-out. Six physical/logical
sides and three alignments are supported. The anchored example uses bottom/end
with an 8px gap. Those values represent the source non-morph positioning path;
they do not substitute for the source trigger-overlap morph.

Menu/Portal retain ancestry using display contents. MenuPositioner is the native
`popover="auto"` with `role="menu"`; its styled MenuPopup child is presentation.
Keeping the semantic menu on the native popover lets Exact's existing menu row
and keyboard rules work. Theme inheritance follows the original tree in the top
layer. Custom portal containers are not supported yet.

MenuTrigger is a native button using the source Glass trigger maps and the small
renderer profile. It accepts rich content, disabled and iconOnly. ArrowDown opens
at the first enabled item; ArrowUp opens at the last. Native activation opens at
the first. MenuItem, MenuItemCheckbox, MenuItemRadio and MenuAction are native
buttons with Exact-owned press actions. Their target/closeOnClick controls native
hide behavior; false retains the menu for a checked-value update. Checked/radio
selection is explicit application state; arrows move focus and activation changes
the value. MenuItemLink is a native link, with disabled navigation suppressed.

Item Label, Content, Description, Icon, Shortcut and Indicator compose rich rows.
Indicator's checked prop retains the node while toggling its visible check.
Section/SectionLabel and RadioGroup expose named grouping; Separator separates
related actions. ActionGroup/Action reuse the source horizontal action geometry.
Viewport is a structural content wrapper; viewport transition behavior is open.
Shortcuts are displayed labels, not registrations of global keyboard shortcuts.

## Keyboard, focus and cleanup

The adapter preserves Exact's native arrows, Home/End, pointer focus and
Escape/light dismissal. Typeahead searches enabled item labels with a 500ms
buffer; repeated characters cycle matching entries. Tab closes the menu and moves
to the adjacent outside control relative to its trigger. Browser shortcut
modifiers remain native. Focus leaving the menu closes it; returning to the
trigger from native pointer focus keeps the menu open. Closing restores focus
when it was inside, while an independently focused outside control keeps focus.
Closed and exiting menu content is inert and hidden from accessibility.

Floating UI DOM 1.8.0 supplies fixed coordinates, flip/shift, available size and
open-only tracking. Stale asynchronous work cannot position a closed/replaced
menu. Native fallback placement stops once the adapter owns its coordinates.
Caller styles compose through the existing registered StyleX path. Reapplying
hatches preserves the menu, focus and action nodes. Teardown releases tracking,
focus/typeahead work, timers, observers, owned attributes and inline coordinates.

## Material and motion

Popup, rows, groups and text reuse the current Lenso menu StyleX maps. Popup uses
the source compact glass-medium material, 34px corners and 250px minimum width
constrained to available space. Its decorative lens uses the shared non-React
renderer with live geometry/backdrop; it is attached only while open and retained
briefly for exit. Contrast/transparency and forced-color preferences detach the
lens and retain the accessible opaque surface. Trigger and popup have separate
optical ownership. The source content fade and anchored popup transform states
are connected; Reduced Motion removes their transitions.

Source trigger morph, elastic dragging/enlargement, shared highlight plate,
resized-popup exit geometry and native-motion reference parity remain open. This
anchored path does not establish those motion contracts or qualified glass optics.

## Focused acceptance

Chromium 156.0.8078.4 and Playwright WebKit 27.2 check 60 affected metadata/class
recipes and 36 physical/logical-side, alignment and direction endpoints. Native
opening, 34px corners and checked-item indentation work with hatches blocked.
Interaction checks exercise first/last opening, native arrow wrapping, Home/End,
disabled updates, typeahead, keyboard/pointer actions, checkbox/radio retention,
link activation, Tab exit, browser shortcut modifiers, opaque preferences,
optics disposal, remounting and hatch reapplication. Captures cover light/dark at
390/820px; emulated touch verifies native item selection and closing. Popover and
navigation regressions run against the same built assets. The entire catalog,
physical devices and qualified optical/motion performance are not covered here.

## Remaining work

Menu remains Partial. [Compact edit-bar parts](MENU_BAR.md) are implemented;
root hover opening, submenu spring choreography, arrows, complete modal focus
guards and scroll compensation, controlled open-state
reasons/payloads, handles, arbitrary custom anchors/portals and full native
render/ref/event forwarding remain open. [Menu modality](MENU_MODAL.md) covers the explicit modal path; source morph
behavior remains open. Disabled navigation before hatch
and native-platform behavior need their own acceptance where relevant.

The compiled example includes real actions, named groups, checkbox/radio state,
a disabled row, a link, destructive content, all placement/alignment controls and
remounting. Browser evidence is recorded separately from compilation and source
parity. Physical-device touch, software keyboard, qualified optical/per-frame
reference acceptance and comparative performance are separate gates. Playwright
WebKit's known backdrop screenshot limitation remains in effect.
