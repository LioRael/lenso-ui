# Exact Web menu modality

MenuPositioner has an explicit modal boolean. Pass true for the source root-menu
modal behavior; existing anchored examples pass false. Submenus inherit the
outer menu's pointer isolation and scroll ownership. Native Exact remains
unchanged. This is menu modality: Tab still closes the tree and leaves relative
to the trigger. It does not turn a menu into a modal dialog or trap Tab.

The positioner authors a transparent internal MenuBackdrop in the native top
layer. A source-shaped polygon cuts out the trigger, so activating it can still
close its menu. Outside presses dismiss without activating the underlying page.
The backdrop remains separate from the menu's compact Glass surface. Additional
MenuBackdrop parts can receive registered caller styles; the internal backdrop
provides isolation even without a caller backdrop. Full custom portal/anchor and
backdrop event forwarding remain separate API work.

Mouse and keyboard opening lock document scrolling. Touch opening follows
Base UI 1.9.0's anchored-popup rule: keep scrolling available unless the popup is
within 20px of the viewport width. A ResizeObserver updates that decision after
placement. The touch acceptance uses a native DOM width fixture for the full-width
case, rather than claiming a new public sizing prop.

The menu and HTML Modal/AlertDialog share a document lock manager. Every owner
releases its own lease, and the last owner restores the exact original inline
overflow value and priority. WebKit can implicitly dismiss a popover when a
dialog opens without emitting the popover toggle events; the adapter reconciles
that dismissal on the dialog toggle so the menu releases its ownership.
Explicit mouse/keyboard openings retain their lock
through the current 160ms decorative exit, matching Lenso's exit-retention intent;
Reduced Motion releases immediately. This does not establish the unported spring
exit choreography. Changing modal while open updates isolation/scrolling without
recreating the menu. Removal releases leases, observers, input listeners and
owned backdrop attributes/coordinates.

Before hatch, the native auto-popover remains available; full menu modality starts
at initialization. Native-platform scroll policy, physical iOS/VoiceOver behavior,
scrollbar compensation, custom scroll containers, source focus guards and
qualified optical/motion/performance acceptance remain open. See MENU.md and
SUBMENUS.md for the broader family gaps.

## Focused acceptance

Chromium 156.0.8078.4 and Playwright WebKit 27.2 pass 66 affected presentation
recipes, background press isolation, a moving trigger cutout, Tab exit, live
modality changes, submenu selection, Dialog lock ownership and removal cleanup.
Emulated touch checks both the guttered and full-width scroll policies. Existing
Modal, AlertDialog, Menu's 36 placement endpoints and four narrow-layout cases
pass against the same built assets. Captures at 390px and 820px wait for settled
content. The WebKit initial-style handoff timed out once and passed its isolated
rerun without a code change. The full catalog browser suite was not rerun.

The local receipt is `.cache/acceptance/menu-modal-acceptance.json`. These checks
establish the tested Web behavior, not physical touch, optical parity, spring
motion parity or a comparative performance advantage. The compiler retains the
existing Popover `lower-dialog-role` warning; this slice adds no compiler warning.
