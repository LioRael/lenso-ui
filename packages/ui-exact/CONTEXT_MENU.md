# ContextMenu for Exact Web

The popup and compact-action paths compose the canonical primitive Menu derivative,
Exact native top-layer behavior and the existing Lenso Menu presentation.
Items, checkbox/radio values, submenus, keyboard navigation, material optics and
focus return use the existing Menu implementation. No parallel item controller,
second popup-open value, React dependency or SDK patch is introduced.

## Parts and state

`ContextMenuState(menu: MenuState, disabled: bool)` supplies the target native
menu's namespace, label, direction and collision/placement configuration. IDs
must be stable and unique. Use `align="start"` and a small side offset for a
pointer-origin popup. The example uses bottom/start, offset 2 and collision
padding 8. The Host remains the open-state owner.

Compose:

- `ContextMenu(state)` contains the target(s) and native positioner.
- `ContextMenuTrigger(state, id, label)` accepts rich target content. It is a
  focusable generic native box with menu naming/expanded intent, matching the
  source's area trigger rather than wrapping content in a button. Disabled
  removes its Tab stop and preserves the browser context-menu fallback.
- `ContextMenuPositioner(state, modal)` derives its actual native `popover=auto`,
  `role=menu` node from canonical primitive Menu. It contains the context backdrop
  and accepts the popup and ordinary Menu submenu composition.
- `ContextMenuPopup(state)` reuses MenuPopup with the source context width of
  250px and existing viewport/collision constraints.

Use the existing `MenuItem`, `MenuItemCheckbox`, `MenuItemRadio`, `MenuAction`,
`MenuItemLink`, labels/descriptions/icons, groups, separators and submenu parts
inside the popup. Their controlled values and native action/close semantics are
unchanged. A submenu retains its own row anchor rather than inheriting the
parent's pointer reference. The context width override applies to the context popup, including a popup
inside an explicit ContextMenuLayout. Multiple triggers can address one root; expanded
markers and focus return follow the actual opener.

## Compact actions and expansion

`ContextMenuBarPopup(state, compact, reset)` supplies the same actual Menu popup
anatomy as `ContextMenuPopup`, with an explicit presentation mode. `MenuPopup`
itself delegates to this shared internal anatomy, retaining its existing public
props, native node, ID and slot structure. Compact presentation uses the existing
`contextMenuStyles.compactPopup` recipe rather than copying its geometry values.

The application owns `compact: bool`. Its `reset()` action sets true on each
accepted opening. In the popup slot, use `if compact` to mount
`ContextMenuBar()` and its items; mount ordinary Menu items in the other branch.
Both branches have real conditional lifetimes. The component does not leave
hidden duplicate menu actions or editors mounted.

`ContextMenuBarItem(id, target, label, press, disabled, variant, closeOnClick)`
uses a canonical MenuItem derivative with shared Menu/context bar recipes.
`ContextMenuExpand(state, label, expand)` adds the source arrow and an accessible
localized label; its native item does not close the popup. `expand()` immediately
sets `compact=false`. Ignoring the request retains the compact branch and focus;
late acknowledgement beyond two animation frames is not an animated expansion
contract. The checkout's [bar example](example/context-menu-bar.contract) is a
verified compiled composition, not a standalone snippet.

Compact menus expose horizontal orientation and use Left/Right with RTL reversal,
wrapping, disabled skipping and Home/End. Up/Down does not move compact action
focus. Full menus restore vertical semantics and the shared Menu keyboard model.
When expansion removes the focused More item, the first available full action
receives focus unless the caller has already focused visible content.

The expansion adapts the source 600/46 spring and translation/scale formula.
It holds the captured compact geometry while collision placement settles,
disables CSS transform chasing during the spring, and restores the previous
inline transform, origin and transition on completion/close/removal. Reduced
Motion applies the full geometry directly. Opening again requests the compact
branch. The source's preview-return and whole-menu elastic motion remain separate
unfinished work.

Initial aliases preserve atomic-rule specificity with `:where`. Compact/full
popup recipes and bar/ordinary item recipes therefore use disjoint selector
cases; overlapping fallback aliases must not reapply ordinary radius/min-height
before the module initializes. The blocked-module fixture verifies a 250x44
popup, 22px radius and 36px actions at 390px/light in both engines. It explicitly
positions the native popup and verifies styles, not pre-hatch point interaction
or horizontal keyboard behavior.

## Input and native release arbitration

Right-click opens at the event's viewport point. Shift+F10 and the ContextMenu
key open from the focused target's lower-left corner. Native left-click or
an ordinary tap retains the target's interaction. Events prevented by a child
and events belonging to a nested context trigger are not consumed.

One touch starts the source 500ms long-press timer. Moving more than 10px on
either axis, multiple touches, end/cancel, disabled state or removal cancels a
pending press. A touch reference uses the source 10px virtual rectangle; mouse
uses a zero-size point. Long-press release clicks are suppressed on the target
and its menu until the compatibility sequence finishes. A fresh pointer press
clears that release suppression, so the next intentional menu tap can activate.

Native auto-popovers can light-dismiss during the opening release. The bounded
opening-gesture arbitration retains the primitive's auto-popover and observes
only that release. It uses physical event timestamps, so synchronous rendering
work cannot turn a quick right-click into a genuine long hold. A short right
release reconciles a native dismissal; a held right-button release outside the
popup dismisses it. The backdrop counts as outside content even though it must
be a child of this native top-layer root.

Touch release can produce compatibility mouse events before the native default
action closes the popup. Reconciliation waits until that default action ends.
Later pointer/keyboard input, outside focus, cancellation and unmount dispose
the opening guard. Escape and explicit earlier dismissal remain authoritative.
A context backdrop suppresses the browser context menu while its custom menu is
active. The context backdrop retains the source dimming and reduced-motion fade.

Removing the active trigger dismisses only the popup it opened. Removing an
inactive sibling does not own that popup. Timers, native release listeners,
observers and click guards are disconnected on cleanup; the shared Menu releases
focus, scroll, positioning and material resources through its existing lifecycle.

## Verification and remaining work

The stock compiled consumer includes the context example without exclusions.
Package tests pass 76 tests / 307 assertions and typechecking covers 131 files;
affected lint/format and the consumer build pass with six pre-existing SDK
warnings from other families. The canonical bridge tests reject a changed Menu
role/anatomy and retain the full generated MIT notice and source fingerprint.

The browser receipts separately cover interaction/rendering, mobile touch and
native release arbitration. They fingerprint both the actual Contract app.js and
the Web controller module, since changing a controller need not change app.js.
Chromium 156 and WebKit 27.2 pass native right-click and Shift+F10, the ContextMenu
key fixture, disabled/native fallback, dangling targets, checkbox persistence,
disabled-row skipping, inherited submenu return, re-anchoring between targets,
active-target removal, pending-long-press cancellation and reconnected-target
behavior. Sixteen popup captures cover 390/820px, light/dark and LTR/RTL, with
250px width, direction and viewport bounds asserted. Both pass the existing
ordinary Menu regression helper with the new optional reference path installed.

Both engines pass native mobile-browser taps; Chromium additionally passes a
continuous native long press, release retention and a subsequent native item tap.
Native release checks in both engines verify the dimmed context backdrop,
browser-context suppression on that backdrop, Escape, explicit dismissal and a
held release outside. A bounded 650ms rendering-stall fixture verifies that a
physically quick right-click is not reclassified using callback processing time.
Two whole-viewport captures show the default modal backdrop. Representative popup
and backdrop images were inspected. Page errors are empty across the receipts; the desktop interaction/rendering
runner also records no console errors.

Full results and final current-source hashes are recorded under
`.cache/acceptance/context-menu-compatibility*/`.

The family remains Partial. Complete preview return motion across engines, elastic motion,
controlled-open/actionsRef and broad callback/ref/render/native forwarding,
initial interaction, the caller-style matrix, physical Safari/iPhone and native
Exact adapters remain open. WebKit native continuous long-press is not established
by synthetic touch events or native taps. Native right-button drag-to-select,
post-open multi-touch/cancel variants and programmatic changes during an already
queued release need their own gates. No source motion/optical parity, performance
improvement or full catalog completion follows from this popup slice.

## Compact-action verification

The package now passes 76 tests / 307 assertions and 131-file typechecking.
Both Chromium/WebKit pass compact horizontal/RTL keys, disabled skipping,
conditional expansion, full-menu action/close, per-open reset, rejected expansion,
Reduced Motion and removal during an active spring. Continuous frame samples
include held compact start geometry and intermediate expansion geometry; inline
motion styles are restored. Sixteen compact/full, light/dark, 390/820px captures
assert radius, width and height. Both pass native mobile-browser More/action taps;
Chromium opens that flow with a continuous native long press, while WebKit's
fixture uses keyboard opening and does not claim native long-press readiness.

The shared-anatomy change also passes the existing ordinary ContextMenu/Menu
regression in both engines. The final selector-only correction has its own
compiled candidate, blocked-module style receipt and focused initialized bar
replay. Native touch and ordinary-menu receipts from the preceding recipe
candidate retain their precise cohort hashes. Final verification records which
sources and atomic CSS are identical across these cohorts; no whole-catalog or
physical-device claim follows.

Receipts: `.cache/acceptance/context-menu-bar-disjoint/`,
`context-menu-bar-initial-disjoint/`, `context-menu-bar-touch/` and
`context-menu-bar-context-regression/`. Earlier snapshots retain the sampled
opening scale and overlapping-initial-alias observations. The family remains
Partial for cross-engine return motion, broad APIs, caller styles and complete motion/optical /
native/device acceptance.

## Preview and layout

Place `ContextMenuLayout(layout, previewAlign)` inside the native positioner and
supply `ContextMenuPreview(id)` and the existing popup as its children. `layout`
is `vertical` or `horizontal`; `previewAlign` is `leading` or `trailing`.
Horizontal layouts switch at 768px; narrower screens stack with an 8px gap.
The shared source recipe supplies a 351px preview, 160px minimum height and 30px
corners, constrained by the viewport. The caller provides the preview contents.
The preview is inert, hidden from accessibility and excluded from menu navigation.
It does not duplicate the trigger or create another interactive menu.

Opening uses the source 600/46 spring and interpolates target geometry and corners.
Closing immediately preserves the native closed/inert state. Where native popover
exit drawing is supported, the layout returns toward the live target, fades the
menu and restores target opacity near arrival. The drawing lease is bounded at
2 seconds and released when the spring settles. Inline styles and priorities are
restored on completion, interruption and preview removal. Reduced Motion settles
immediately, including a preference change during return.

**WebKit 27.2 limitation:** the tested browser removes the closed popover from
rendering immediately despite discrete display transitions. This implementation
restores the target immediately in that case; it does not claim a visible return
animation in WebKit. Chromium 156 retains native exit drawing and exercises the
complete return path. Neither observation establishes a performance improvement.

The focused preview runner checks keyboard exclusion, compact-to-full expansion
inside the layout, opening/closing reversal, caller opacity restoration, preview
removal and Reduced Motion. A 32-capture matrix covers both engines, two widths,
two themes and all layout/alignment combinations. Continuous closing samples
separate retained drawing from the WebKit immediate-close fallback. The existing
ContextMenu/Menu and compact bar regressions are required for the shared popup
lookup and presentation changes. Receipts are under
`.cache/acceptance/context-preview*/`; each records its exact compiled cohort.
This remains a Partial family: full callback/ref/render APIs, arbitrary caller
styles, optical/motion parity, native adapters and physical-device acceptance
remain open.
