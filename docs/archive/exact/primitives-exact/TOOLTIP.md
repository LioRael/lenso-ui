> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Tooltip

`Tooltip` is a text-only, nonmodal hint. `TooltipTrigger` is an optional native
button convenience. The exported state transitions can instead attach to an
authored native button alongside a Dialog command; see `open-dialog` in the
[runnable fixture](example/app.contract). No wrapper, extra focus stop or
JavaScript hatch is required for that composition.

The package compiles against unmodified Exact. Basic Tooltip intent/cleanup is
a core probe; shared-trigger composition with nested Dialog lifetimes is
experimental. Host AX and focus behavior are limited to the observed
[stock baseline](VERIFICATION.md); historical patched results are not a guarantee.

## Ownership

The primitive owns the transition rules. The app owns one `TooltipState` for
each mounted tooltip, the root task, and the action that projects `state.open`
through `showPopover`/`hidePopover`. The host owns the clock, event delivery,
nonmodal top layer, anchor placement, collision fallbacks and accessibility
API. The compiler checks declared types; it does not prove these ID edges or
that the app connected its task and actions correctly.

The root task is explicit because Exact forbids child `task`s and computed
`after` delays. A gated 16 ms task checks absolute deadlines; idle tooltips
request no ticks. An expiry may arrive up to one task interval late, plus host
scheduling delay. A cancelled deadline cannot subsequently open the tooltip.

## Complete root connection

This example uses the package's declared API and is compiled by the contract
probe suite. The full fixture additionally exercises two independent tooltip
states, a custom Dialog invoker and cleanup before disabling/removing controls.

```contract
use TooltipState, TooltipInitial, TooltipTick, TooltipDismiss, TooltipTrigger, Tooltip from "@lenso/primitives-exact"

component App
  state tip = TooltipInitial()
  state count = 0
  task deadline when tip.due >= 0
    every(16, expire)
  action update(next: TooltipState)
    tip = next
    if next.open
      showPopover("help", source="help-trigger")
    else
      hidePopover("help")
  action expire
    if tip.due >= 0 and performanceNow() >= tip.due
      update(TooltipTick(tip, performanceNow()))
  action escape(name: string)
    if name == "Escape" and (tip.open or tip.due >= 0)
      preventDefault()
      stopPropagation()
      update(TooltipDismiss(tip))
  action increment
    count = count + 1
  view
    column keycapture=escape
      TooltipTrigger(id="help-trigger", label="Add", target="help", description="", state=tip, delay=500, closeDelay=150, disabled=false, change=update, press=increment)
        text "Add"
      Tooltip(id="help", message="Add one to the count.", state=tip, delay=500, closeDelay=150, change=update)
      text `${count}`
```

`update` uses its `next` argument for commands. Exact assignments commit when
the action ends; reading `tip.open` after assigning `tip = next` would read the
previous state. Do not independently toggle the popover from another action.
Use the same delay values on the trigger and content. Before disabling or
unmounting, also issue `blur("help-trigger")` and `update(TooltipInitial())`;
UIKit may otherwise retain its native first responder across disable/enable,
so refocusing it does not deliver a fresh `focus` event.

`TooltipHover`, `TooltipContentHover`, `TooltipFocus`, `TooltipDismiss` and
`TooltipTick` are pure Contract functions. They return the next record and
perform no side effects. Native button adapters bind `hover`, `focus`, `blur`,
`key` and `press`; an app-authored trigger can use these same transitions while
retaining its complete native API. `description` on the convenience trigger
contains any existing description IDs; it appends the tooltip ID. With an
authored button, preserve that full ID list in `aria-describedby` yourself.

## Behavior

| Input                                       | Result                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Pointer enters trigger                      | Opens after `delay`; leaving before expiry cancels opening                                  |
| Keyboard/programmatic focus                 | Opens immediately and leaves focus on the trigger                                           |
| Pointer enters open tooltip                 | Remains open; cancels pending close                                                         |
| Neither trigger nor content hovered/focused | Closes after `closeDelay`                                                                   |
| Escape anywhere in the app scope            | Root capture handler dismisses an open/pending hint and consumes that Escape                |
| Trigger activation                          | Dismisses hint, runs the caller's action once; native activation/commands remain the host's |
| Focus/hover continues after dismissal       | Stays closed until that intent ends                                                         |
| Disabled/removal                            | App blurs its trigger, resets state and hides the popup before changing availability        |

The root Escape connection matters for pointer-only hints: keyboard focus may
still be on another control. The trigger's own handler alone cannot hear that
Escape. A root coordinating several hints dismisses all open/pending hints in
one capture handler. Shortcut and Dialog behavior should see the key only when
that handler did not consume it.

The content accepts a string, not arbitrary children; it creates no controls,
autofocus or Tab stop. It exposes `role="tooltip"` and the trigger describes
it through `aria-describedby`. The chosen `position-area="top"` has block and
inline flips. These are placement rules, not a promise of identical pixels on
every host. Explicit fallbacks also select Exact's painted AppKit popover path,
which keeps keyboard focus in the page rather than opening a key NSPopover.

A click/tap activates and dismisses; there is no long-press action, modal touch
presentation or reliance on hover for essential information. The description
remains associated for assistive access. Exact's native button contract does
not expose a pre-focus pointer handler without becoming a bare button; strict
suppression of all intermediate touch-generated focus hints needs a host input
modality capability. Physical-touch and spoken announcements are unverified.

These choices follow the [APG tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/)
(which is itself marked work in progress): retain trigger focus, support
Escape, and keep hover content available. Interactive supplementary content
should use a Popover or nonmodal Dialog instead.
