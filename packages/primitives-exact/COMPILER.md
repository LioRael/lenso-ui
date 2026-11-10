# Static composition checks

The compiler change is [exact-compiler-relationships.patch](patches/exact-compiler-relationships.patch),
against Exact `956ae33a35ffa5313d7be3cebc55ed84f9480e0a`. It is independent of
the four Host diffs. The Host fixes are still needed for native behavior and AX;
static checking does not provide a focus trap, presentation or runtime naming.

The new `contract/analyze/src/relationships.rs` runs from `check_all` over the
expanded root. Imported components, substituted props and slot content therefore
share one graph. No component names, package names or new Contract keywords are
special-cased. Findings retain authored spans and target declarations as related
locations. They participate in the compiler's existing multi-error reporting.

## Rules and diagnostics

| Diagnostic               | Statically rejected                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `analyze-command-target` | Empty/multiple command target IDs, a missing literal target, or a target declared only in an incompatible `if`/`match` arm                                 |
| `analyze-command-kind`   | `show-modal`/`close` targeting a non-`dialog`, or popover commands targeting an element without `popover`                                                  |
| `analyze-aria-reference` | An unresolved token in a literal `aria-labelledby`, `aria-describedby` or `aria-controls` list                                                             |
| `analyze-dialog-name`    | Native `dialog`, `role="dialog"` or `role="alertdialog"` with no name source, a whitespace-only label, or a label reference whose text is statically empty |

Commands include `commandfor`/`command`, `popovertarget`, and literal first
arguments of action calls to `showModal`, `close`, `showPopover`, `hidePopover`
and `togglePopover`. `close()` without a target retains its window semantics.
Custom/unknown command names receive identity checking, not invented target-kind
rules. The checker does not execute actions, resources or application functions.

Forward references are allowed. Every ARIA list token is checked, not only the
first. An empty `aria-describedby`/`aria-controls` list is allowed. Dialog body
text and description are not a name; a named heading must be connected with
`aria-labelledby`. Referenced hidden text is not rejected just for being hidden.
This follows the [APG naming guidance](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/),
with a deliberately narrow static approximation of the
[accessible name algorithm](https://www.w3.org/TR/accname-1.2/).
The policy requires named Dialogs; it does not claim every ARIA specification
version has identical conformance requirements.

## What is not proved

A successful compile is not a computed accessibility tree:

- Literal strings, string-only templates/concatenations and equal conditional
  string arms are resolved after expansion. Arbitrary state, derives, record
  fields, function results, localization and action-local dataflow are not
  evaluated by this pass.
- Dynamic references and names remain runtime obligations. If a compatible
  element has an unknown dynamic ID, the graph cannot prove a literal target is
  absent or of the wrong kind; those negative proofs are deferred.
- A conditional or repeated target may exist only at certain times. The checker
  rejects mutually exclusive authored arms, but does not prove arbitrary
  condition implications, cardinality, uniqueness, route reachability or that a
  trigger and target remain mounted together after an action.
- Naming checks can prove clearly absent/empty text; they do not implement the
  full recursive accessible-name computation. Referenced controls, chained
  labels and dynamic/conditional text require Host AX observation.
- Event cancellation/priority conflicts, such as two invocations on one button,
  remain accepted compiler gaps. Focusability and platform availability are not
  added to this patch.

The regression suite labels dynamic cases `runtime-obligation`, distinct from a
verified static connection. The fixture's existing trigger removal, modal
subtree removal and route disposal remain supported runtime tests.

## Regressions

`test:contracts` builds correct and incorrect imported/local compositions using
the actual compiler. It now expects the former unnamed/missing-target gaps to
fail with stable diagnostic IDs. Positive cases include forward references,
multiple ARIA targets, imported Dialog/Trigger parts, slot-provided titles and
native action commands. Negative cases include every supported ARIA reference,
wrong command kinds, empty imported labels/headings and incompatible branches.

The SDK integration tests in `contract/cli/tests/relationships.rs` also verify
multiple independent diagnostics from one compilation. That focused target
contains 64 tests, grouping the new graph cases with the existing alert/menu,
geometry and top-layer cases without duplicating them in the large test target. Existing compiler tests
must provide valid names and targets when those are not the subject under test.
No primitive-side source scanner or JavaScript runtime shim supplies these rules.

```sh
EXACT_ROOT=/absolute/path/to/patched-exact bun run test:contracts
# From Exact, using its pinned toolchain:
cargo test -p contract --test relationships --no-fail-fast
cargo check -p contract -p contract-analyze --all-targets --keep-going
cargo test -p contract --tests --no-fail-fast
cargo clippy -p contract -p contract-analyze --all-targets --keep-going -- -D warnings
```

Linux OS and AT-SPI validation remain unchanged and unverified by these compiler
checks. No new Host fix is required for static diagnostics.
