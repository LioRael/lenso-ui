# Tabs for Exact Web

`TabsState` contains `id`, `label`, `value`, `orientation`, `direction`, `size`,
`align`, `lift`, `elastic`, `glass`, `disabled`, `activateOnFocus`, `loopFocus`.
Orientations are horizontal/vertical, directions ltr/rtl, sizes sm/lg and alignment
start/center/end. Lift is a finite non-negative pixel amount. Source defaults are
horizontal, centered text, sm, lift 20, elastic on, glass off, automatic focus
activation and looping keyboard focus. The Exact state must supply these values.

Compose `Tabs`, `TabsListContainer`, `TabsList`, `TabsIndicator`, `TabsTab`,
`TabsPanel` and optional `TabsSeparator`. All parts receive the same state where
requested. Each tab supplies a stable id, string value, panelId, accessible label,
its own disabled flag, a change action and rich label content. Each panel supplies
its id, value, tabId, keepMounted and caller content. `change(nextValue)` proposes
a selection; the caller owns it and may reject it. Reselecting a tab does not
emit another value change.

## Interaction and panels

Native buttons expose tab semantics and aria-selected. Disabled tabs remain
programmatically focusable, as Base UI's tabs contract permits, but are excluded
from roving keyboard focus and cannot activate. Arrow navigation skips disabled
tabs, respects orientation/RTL and optionally loops; Home/End select the keyboard
boundary. Automatic mode activates a newly focused enabled tab; manual mode
requires Enter/Space. Secondary mouse presses do not activate through focus.
External selection updates the keyboard entry point without overriding an enabled
tab that already holds focus. Removing the focused tab restores focus to an
available tab and follows the chosen activation mode.

Panels expose tabpanel/label relationships and a selected-panel tab stop.
`keepMounted=true` preserves an inactive panel's DOM with hidden/inert behavior;
false removes its DOM. Exact retains ownership of caller state, which is distinct
from DOM retention. Native control relationships are updated against mounted
panels so tabs do not keep dangling aria-controls references after unmounting.

## Shared presentation

The port retains Lenso's tabs maps, source selection springs, press/drag geometry,
velocity deformation, local label refraction, optional elastic press and optional
small Glass track. It does not substitute an underline or another tab design.
The source's decorative label copies live only in the internal inert highlight
rows. They receive isolated ids and lose Exact ownership/test markers; the
original buttons and caller content remain in place. Source notices are retained.

Selected flags project from declared data into initial CSS before the native
hatch connects. The hatch supplies native active flags, non-default lift variables,
panel hidden/inert and mounted-panel links. Static caller StyleX maps compose last
through the existing rule registration, including overrides of public lift variables;
the state parameter uses a private fallback variable. Geometry and motion resources, pointer
capture, observers and listeners end with their owning list. Track optics follow
the shared contrast/reduced-transparency/forced-color fallback.

## Evidence and remaining acceptance

`test/tabs.mjs` checks names/relationships, automatic/manual keyboard activation,
skipping and programmatically focusing disabled tabs, non-looping boundaries,
RTL/vertical navigation, secondary presses, global disabling, rejected proposals,
no-op reselection, drag activation, persistent button identity, focus restoration
on removal, retained drafts, panel unmount/remount and mounted control links.
It also checks large sizing, optional Glass and accessibility fallback, reduced
motion and list removal/remount. Ordinary screenshots cover horizontal/vertical,
light/dark and 390/820px. Initial CSS and recipe parity checks run separately.

The family remains Partial. Horizontal overflow menus, vertical scroll/shadow
controls, panel exit-presence and activation-direction attributes, the broader ref/render/event contract,
source-to-port transition footage, optical acceptance and physical touch/scroll
acceptance remain open. The current list container supplies the basic source
composition; it does not claim the source overflow system. No removed secondary
variant is reintroduced. WebKit's automated Glass capture remains unqualified
(VISUAL_CAPTURE.md), and these checks are not a performance benchmark or native
platform acceptance.
