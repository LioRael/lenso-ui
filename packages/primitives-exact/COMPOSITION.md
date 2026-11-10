# Composition contract

Exact Primitives: composable behaviors, native semantics, verified contracts.

Composition is the authoring model. Contract describes the semantic boundary.
The compiler can verify only relationships represented in its input model;
tests must check everything else against the real host.

## Use an authored native element for a behavior

The current Exact command protocol already separates an invoker from its
target. A dialog trigger does not need a wrapper or an extra visual node:

```contract
use Dialog, DialogClose from "@lenso/primitives-exact"

component App
  view
    column
      button id="settings-trigger" testId="settings-trigger"
        commandfor="settings" command="show-modal" buttonStyle="filled"
        text "Settings"
      Dialog(id="settings", label="Settings", description="settings-description")
        text "Settings" role="heading" aria-level=2
        text "Manage your preferences." id="settings-description"
        button commandfor="settings" command="close"
          text "Done"
```

The developer controls the invoker's content and native attributes. Exact owns
activation and the dialog's platform presentation. The library's DialogTrigger
and DialogClose remain conveniences for their declared props, not a required
composition boundary. An app can use its own button component if that component
explicitly exposes the native command props it needs.

This is declarative binding through existing Contract attributes. It does not
introduce `behavior`, `attach`, `focusScope`, `overlay` or `semanticRole` syntax.
Contract's `slot` and `provide/inject` are not generic attribute forwarding:
slot content retains the caller's bindings and providers. A wrapping Root must
not assume it can inject its private state into arbitrary caller-authored parts.

## State and event ownership

| Concern                                                   | Owner in this version                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------------- |
| Editable values, selected tab, disclosure/accordion value | Application state and typed actions                                       |
| Modal/popover open state and presentation                 | Exact host command protocol                                               |
| Activation and disabled suppression                       | Native control and host                                                   |
| Focus movement, modality and dismissal                    | Exact host; verify its platform implementation                            |
| Accessible names and ID relationships                     | Authored Contract; library derives only the relationships its parts share |
| Visual layout and appearance                              | Author styles and platform defaults                                       |

Do not add a second `open` boolean for an overlay whose host already owns it.
Do not combine a `press` action that changes overlay state with a native command
that changes it independently. A native command and an unrelated action can
share a button only when their order and cancellation behavior are established
by Exact's contract. A tooltip must not steal the dialog trigger's focus or
activation. Those are acceptance requirements, not automatic consequences of
having typed attributes.

## Three probes before a behavior abstraction

| Probe   | What is implemented                                                                         | What still needs proof or upstream capability                                                                           |
| ------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Tabs    | Explicit selected value, tab/panel IDs, inactive panels hidden and inert; host roving focus | Native focus/selection exposure; compiler validation of the complete tab graph                                          |
| Dialog  | Native command invoker and modal target, accessible label and description; host lifecycle   | Native modal isolation, entry/return focus, cancel paths and nested modal stacks                                        |
| Tooltip | Exact's advisory `title` is available on native elements                                    | A full tooltip contract: keyboard focus, delays, hover persistence, Escape, positioning, composed trigger, touch policy |

Exact documents `title` as browser advisory text on Web and `toolTip` on
macOS; touch hosts show none. It is not a complete Tooltip primitive. This
package therefore does not export a Tooltip wrapper that silently claims those
behaviors. A future tooltip needs a generic scheduling/lifecycle seam usable by
library components and a host-supported relationship to its trigger. Its
minimum implementation must pass focus, pointer, clock and accessibility tests
before becoming a public primitive.

A compiler probe on 2026-11-11 confirmed that a timer inside a child component
is rejected with `type-child-resource`. Root-owned timing can support an
application composition, but is not an encapsulated Tooltip implementation.

Nested modals are not inherently invalid. A valid stack must keep only the
active scope interactive, restore focus to the preceding scope when popped,
and finally return to its invoker. Compiler checks should identify unsupported
or conflicting arrangements rather than rejecting every nested dialog.

## Compiler evidence versus host evidence

Current compiler guarantees include declared prop types, action boundaries,
known element/attribute vocabulary and native control restrictions. Those do
not prove that arbitrary dynamic IDs resolve, labels are nonempty in every
runtime state, a custom trigger is focusable, or two composed behaviors have
compatible event ownership. Wrapper exports cannot add those compiler proofs.

The same probe accepted an unnamed normal dialog and a button whose literal
`commandfor` names no target. It also accepted a native button combining
`buttonStyle`, advisory `title` and a dialog command. These are observed
boundaries of the pinned compiler, not proposed compiler guarantees.

For a compiler proposal, first retain a runnable positive fixture and a
negative fixture with an expected diagnostic for each new guarantee. Prefer
checks over existing command targets, semantic roles and accessibility
relationships before adding a new behavior language. Dynamic relationships
need an explicit runtime verification strategy.

The same Contract interaction tests run on each available host. Separately,
read `tree --ax` for the platform's own accessibility facts: names, roles,
disabled/checked/pressed/expanded states and modal/hidden exposure. A plain
runner tree is semantic intent, not proof that assistive technology sees it.
The pinned Linux host explicitly exposes no AT-SPI tree; this remains an
upstream accessibility gap even when its interaction tests pass headlessly.
