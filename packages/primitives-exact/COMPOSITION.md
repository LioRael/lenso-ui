# Composition contract

Exact Primitives: composable behaviors, native semantics, verified contracts.

Composition is the authoring model. Contract describes the semantic boundary.
The compiler verifies only relationships represented in its input model; tests
check the remaining behavior against the host. This package adds no `behavior`,
`attach`, `focusScope`, `overlay` or `semanticRole` syntax.

## Three implemented probes

| Probe   | Primitive                                                                                                     | Application                                                                                          | Compiler / Host                                                                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tabs    | Tab/panel relationships, selected semantics, hidden/inert inactive panels, horizontal/vertical layout         | One selected value; ensure it names a mounted, enabled tab                                           | Compiler enforces the orientation enum; host owns roving focus, disabled skipping and key activation                                                |
| Dialog  | Named `dialog`, description ID, `closedby="closerequest"`, optional command buttons                           | Content, trigger appearance and save actions                                                         | Host owns presentation, focus entry/containment/return, cancel/close and modal isolation; compiler checks statically decidable names and references |
| Tooltip | Pure intent/deadline transitions, optional native trigger, noninteractive hint content, described-by relation | Controlled state, gated root task, command projection, root Escape arbitration and lifecycle cleanup | Compiler forbids child tasks and computed `after`; host supplies input, monotonic clock, nonmodal popover, anchor/fallback placement and native AX  |

[Tooltip](TOOLTIP.md) documents the complete connection. Tabs use manual
activation: arrows move focus; Space/Enter selects. The horizontal and vertical
fixtures have independent owners, skip disabled items and keep inactive panels
out of focus. The host also owns locale/direction-specific navigation; RTL and
removing the selected tab need further acceptance before being promised.

Dialog deliberately uses close requests rather than outside-click dismissal.
For a different dismissal policy, author Exact's native `dialog closedby="any"`
or `closedby="none"`; the convenience wrapper does not forward arbitrary
attributes. AppKit sheets and UIKit sheets/alerts keep their platform behavior.
For a save that must remain open on failure, use a native button with its action
and issue `close(id)` only when the app accepts the result.

## Compose on one authored native element

A Dialog invoker does not need another visual node:

```contract
button id="settings-trigger" testId="settings-trigger" buttonStyle="filled"
  commandfor="settings" command="show-modal"
  aria-describedby="settings-help" hover=helpHover focus=helpFocus blur=helpBlur
  key=helpKey press=dismissHelp
  text "Settings"
```

The runnable fixture supplies these typed actions, the Tooltip state, its root
task and both target surfaces. It verifies that Tooltip focus does not activate
the Dialog, Space dismisses the hint and opens the Dialog once, and returning
from the Dialog restores its invoker. The library's specialized triggers are
conveniences, not mandatory composition boundaries.

Use native `button` for ordinary actions; its full API remains available.
Contract's `slot` is not an attribute spread, and slot content retains the
caller's bindings/providers. A wrapping Root cannot silently inject its private
state into arbitrary caller-authored parts. The explicit state/ID/action model
keeps that ownership visible without depending on React context or ref merging.

## Event and state ownership

Keep one owner for each editable value and selection. Overlays use the host's
open state except Tooltip, whose one controlled record determines both intent
and projected visibility. Do not add a second independent boolean or combine a
state toggle and a native toggle for the same overlay.

For Tooltip, hover/focus update the controlled record; expiry is root-owned;
Escape cancels it before ancestors or native Dialog cancellation; activation
dismisses it before the native command proceeds. The shared root handles Escape
when a pointer tooltip is open and keyboard focus is elsewhere. These rules are
implemented and tested, not inferred from having typed attributes. Arbitrary
combinations of keyboard handlers still require one explicit arbiter; the
compiler cannot prove their cancellation compatibility.

## What the compiler verifies today

The supported API and callback payloads are documented in [API.md](API.md).
`test:contracts` compiles retained positive and negative probes against the real
compiler and writes `.cache/contracts/results.json`:

| Probe                                                                | Pinned compiler result          |
| -------------------------------------------------------------------- | ------------------------------- |
| Tooltip state/actions, root scheduler and popover command connection | Accepted                        |
| Input using checkbox `type`                                          | `type-prop`                     |
| Disabled close controls through named subpaths                       | Accepted                        |
| Root import of internal TooltipIntent                                | `contract-use-unknown`          |
| Invalid Tabs orientation                                             | `type-prop`                     |
| Task in a child component                                            | `type-child-resource`           |
| Computed `after(delay, action)`                                      | `lower-timer-literal`           |
| Dialog without an accessible name                                    | `analyze-dialog-name`           |
| Literal command target that does not exist                           | `analyze-command-target`        |
| `aria-describedby` naming a missing ID                               | `analyze-aria-reference`        |
| Two invocations on the same button                                   | Accepted: conflict-checking gap |

The [compiler relationship patch](COMPILER.md) adds these semantic checks after
component expansion. Correct imports, slot titles, forward references and ARIA
lists compile; missing references, wrong command kinds and empty names fail with
stable diagnostics. The tests use the real compiler, not a library source linter.

Dynamic IDs/names, conditional target lifetime, arbitrary action dataflow and
competing invocations remain runtime obligations or accepted gaps. A successful
compile does not prove these cases safe. The root Tooltip scheduler and native
AX/focus tests remain necessary. No general behavior language is introduced.

## Verified modal stack

Two- and four-level Dialog stacks now run in the default suite, with no optional flag or
host-specific skips. The same Contract tests cover inner Escape, explicit close,
reopening, parent activation after the child closes, and page activation after
the parent closes. Browser checks additionally reject parent programmatic focus,
verify return to each invoker, preserve current authored `inert` values and keep
a cancelled opening from locking its parent. Native AX observations require only
the active Dialog to be exposed, then its parent after closing the child.

The required fixes belong to Exact, not to extra state in the Dialog primitive:

| Exact owner                                | Required change                                                                                                                                                                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AppKit `NodeViewMac.swift`                 | `isAccessibilityElement()` must respect the host's existing `accessibilityHiddenWritten` flag. The covered outer Dialog had no exposed children but still exposed its own Dialog element.                                         |
| Web `dialog-modality.js` / `navigation.js` | Keep covered modal Dialogs inert in opening order. Release the preceding scope before native close restores focus; project the completed opening on `toggle` and app commits. The browser still owns focus entry, Tab and return. |
| JS `rt.js` / Wasm `glue.js`                | Combine authored inert with the Host's modal gate. An app update cannot unlock a covered Dialog; uncovering restores the current authored value.                                                                                  |
| Web staging `glue.mjs`                     | Include the shared modality module in generated runtime copies and source receipts.                                                                                                                                               |
| Agent `agent-ax.mjs`                       | An observed modal escapes inert ancestors. Preserve the separate `aria-hidden` ancestor diagnostic. Chrome's real AX tree exposed the valid inner modal while the old diagnostic falsely called it hidden.                        |
| iOS `AgentIOS.swift`                       | The previously supplied Escape patch routes recognized keys to existing sheet cancellation; UIKit hardware-key behavior is unchanged.                                                                                             |

The AppKit fix changes actual accessibility exposure, not the observer's root
selection. The Web correction also reproduces in a minimal HTML button-command
fixture on WebKit 27.2; it is not a reason to reject nested Dialog contracts at
compile time. The [verification report](VERIFICATION.md) lists the patch order
and the tested engines/OS versions. The Wasm setter is kept consistent but has
not had a separate Wasm consumer acceptance run.

The lifecycle probes also remove child/page invokers, unmount the two deepest
surfaces together, push away from a retained source route and return, or dispose
the source while pushing. Only the front scope may be exposed in AX; restoration
must choose a live eligible target and preserve destination autofocus after the
old stack retires. These use the same Contract tests on each platform, backed by
real browser focus and native AX/current responder checks.

The [lifecycle Host patch](patches/exact-dialog-lifecycle.patch) handles authored
route ownership, sheet dismissal completion, missing-invoker fallback, native
focus-event propagation and empty navigation focus. Primitives supply native
commands and named slotted content; apps own route/mounting state and Tooltip
cleanup. The compiler's existing semantic gaps remain separate from these Host
corrections. Four levels are verified, not unbounded depth or interactive
navigation cancellation. Linux OS and AT-SPI gaps remain unchanged.
