# Composition contract

Composable controls, native semantics, explicit verification boundaries.

This package targets unmodified Exact
`956ae33a35ffa5313d7be3cebc55ed84f9480e0a`. Composition uses existing `component`,
`slot`, props, actions and imports. It adds no `behavior`, `attach`, `focusScope`,
`overlay` or `semanticRole` syntax and requires no compiler/Host patch.

## Ownership

| Layer          | Owns                                                                                      | Does not supply                                                              |
| -------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Primitive      | Named parts, semantic attributes, ID wiring, controlled transitions and action calls      | Host fixes, private focus traps or a replacement accessibility tree          |
| Application    | Values, selection, stable IDs, names, route/mounting state and Tooltip scheduling/cleanup | An independent Dialog `open` boolean competing with native presentation      |
| Exact compiler | Existing types, prop checking, slots, expansion and lowering restrictions                 | Static proof of command/ARIA edges, nonempty Dialog names or event conflicts |
| Exact Host     | Native controls, event delivery, focus, overlays and accessibility projection             | Cross-platform parity beyond the observed stock baseline                     |

Use native `button` for ordinary actions and customized triggers. Its complete
API remains available directly. Specialized triggers expose explicit props;
there is no transparent attribute spread, React context, ref merge, `render` or
`asChild` mechanism. Slots retain caller bindings, so parts share state and IDs
explicitly instead of assuming a wrapping Root injects private state.

## The three composition probes

**Tabs** shares an application-owned selected string. Each tab names its panel,
and each panel names its tab. The primitive supplies semantic intent, hidden
panels and controlled activation; the Host supplies keyboard focus and AX
projection. Passing selection tests alone does not prove AppKit tab AX mapping.

**Dialog** uses native commands and slotted named content. Basic single-modal
open/close and synchronous confirmation are core scenarios. Native Escape
input, covered modal isolation, nested unwind, four-level restoration, missing
invokers, subtree removal and navigation cleanup have explicit experimental
coverage. Their result depends on the stock Host; the primitive does not repair
it or claim the old patched results as upstream support.

**Tooltip** owns pure intent/deadline transitions. The application connects one
record, a gated root task, popover commands and Escape arbitration. The Host
owns events, placement and accessibility. Reset intent before disabling or
unmounting the trigger. A Tooltip and a native command can share a button;
combining that trigger with nested modal lifetimes remains experimental.

## What the stock compiler proves

`test:contracts` compiles real imported components and reports expected upstream
outcomes. Correct imports, slots, forward references, supported Input modes and
Tooltip scheduling compile. Invalid Input/orientation enums, child tasks,
computed timer delays and importing the internal Tooltip helper are rejected.

Missing Dialog names, missing command/ARIA targets, wrong command kinds and
mutually exclusive target branches are **accepted gaps** on stock Exact. So is
binding competing invocations to one button. Dynamic names/IDs and conditional
lifetimes remain runtime obligations. Supplying an ARIA string does not prove
the corresponding semantic edge exists or is currently mounted.

See [COMPILER.md](COMPILER.md) for diagnostic boundaries. Repository-only
compiler proposals can be tested explicitly with `research:contracts`; they
are not prerequisites for this library and are not its default compiler tests.

## Core and experimental validation

The complete seventeen-scenario agent fixture is retained unchanged. Eight
core scenarios run by default; nine scenarios run additionally with
`EXACT_AGENT_SCOPE=all`. The combined keyboard scenario is experimental because
it also checks native Dialog Escape; browser core checks separately exercise
ordinary button and Tabs keyboard operation. Every original assertion remains
available. The classification is in `test/scenarios.json`.

Browser checks default to core controls, Tooltip, Tabs, a single Dialog/alert
and menu operation. `EXACT_BROWSER_SCOPE=lifecycle` also runs the original
nested/lifecycle assertions. Strict failures remain failures; the baseline
collector records them and returns nonzero when any phase fails.

Native AX controls and modal/lifecycle scopes are checked independently; a
control-role failure cannot prevent the separate modal probe from running.
Native AX is also checked independently from state/agent results. A core agent pass
is not proof of role/state exposure or covered-modal AX isolation. Current
stock results and platform-specific restrictions are in [VERIFICATION.md](VERIFICATION.md).
Linux OS and AT-SPI acceptance remain unverified.
