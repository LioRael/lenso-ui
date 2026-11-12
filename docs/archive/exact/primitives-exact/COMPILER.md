> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Stock compiler boundary

The supported compiler is unmodified Exact
`956ae33a35ffa5313d7be3cebc55ed84f9480e0a`. No compiler patch is required to
import, compile or use this package. The normal `test:contracts` command tests
that compiler's actual behavior, including accepted invalid compositions.

## Observed outcomes

The 26 real compiler probes contain seven accepted correct compositions, five
existing compiler refusals, thirteen accepted gaps and one dynamic runtime
obligation. Accepted gaps are not static safety proofs.

| Case                                                                                                                     | Stock compiler                 |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------ |
| Imported components, slot-provided titles, forward references, ARIA lists, native action targets and Tooltip root wiring | Accepted                       |
| All six supported textual Input modes; disabled close controls via subpaths                                              | Accepted                       |
| Invalid Input/orientation enum                                                                                           | `type-prop`                    |
| Root import of internal `TooltipIntent`                                                                                  | `contract-use-unknown`         |
| Task in a child component                                                                                                | `type-child-resource`          |
| Computed timer delay                                                                                                     | `lower-timer-literal`          |
| Missing/empty Dialog name or empty referenced heading                                                                    | Accepted gap                   |
| Missing command target or wrong modal/popover target kind                                                                | Accepted gap                   |
| Missing token in `aria-labelledby`, `aria-describedby` or `aria-controls`                                                | Accepted gap                   |
| Literal target available only in an incompatible conditional branch                                                      | Accepted gap                   |
| Two invocations bound to one button                                                                                      | Accepted conflict-checking gap |
| Dynamic names/IDs and conditional mounted lifetime                                                                       | Runtime obligation             |

Empty native `commandfor` and `popovertarget` attributes retain their upstream
unbound/no-op behavior. For useful invocations, authors must supply a live,
correctly typed target. Dialog body text and descriptions do not substitute for
an accessible name. Referenced names/descriptions must exist; the app owns
stable unique IDs and meaningful nonempty labels.

The disjoint-branch probe has a normal `column` root so an unrelated root-region
lowering error cannot masquerade as relationship validation. Compiler outcomes
are saved in `.cache/upstream/contracts/results.json` by default.

```sh
EXACT_ROOT=/absolute/path/to/stock-exact bun run test:contracts
```

## Optional upstream research

The earlier relationship-analysis proposal adds expanded-root checks with the
diagnostic IDs `analyze-command-target`, `analyze-command-kind`,
`analyze-aria-reference` and `analyze-dialog-name`. Those diagnostics are **not
part of stock Exact or the primitive API**. Requiring names globally also
changes which existing SDK apps/fixtures compile; it needs upstream policy
review rather than an implicit library installation step.

Repository-only `patches/` retains that proposal and four Host experiments for
review. It is excluded from the distributable package. Neither builds nor
normal tests apply it. An explicitly prepared research SDK may use:

```sh
EXACT_ROOT=/absolute/path/to/research-exact bun run research:contracts
EXACT_ROOT=/absolute/path/to/research-exact bun run research:host-patches check
```

The proposal keeps dynamic dataflow/lifetimes and competing invocations outside
its proof. Its historical full SDK tests and `difftest quick` results belong to
the modified SDK; they do not establish stock compatibility. Current upstream
acceptance is recorded in [VERIFICATION.md](VERIFICATION.md). No new Host or
compiler fix is required for the package's supported syntax and imports.
