# Bounded Menu and Toast acceptance corrections

## Handoff manifest

Read-only handoff root:
`/Users/leosouthey/Projects/framework/lenso-ui/.delta/worktrees/qvwepcwcah6z/lenso-ui`.

Only these two executable files changed in this task:

| File                                                            | SHA-256                                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------ |
| `packages/react/src/components/modal/overlay-fidelity.test.tsx` | `d8697c19ca1ee197a4eb88e2c3528101b27aae075005d90edf2803d85005dc0f` |
| `packages/storybook/stories/menu-toast-proof.mjs`               | `c26ae2930bc0fb177510812c98e86e3d6b14b6926ffeb999f91e769ae4a91f2e` |

The original Toast test was verified before changing it:
`9c4f373afc89ea78d00033dc713a063bd98aae2bb22dc1ee4b6abff322cd37e0`.
No component, native dependency, theme, StyleX geometry, primitive, root lock,
or `menu.stories.tsx` changes were made.

## Menu cause and proof

The unchanged original production artifact in srth041rag3a's
`test-results/final-0.9-integration/workspace-v2` was served read-only.
Instrumentation ran the original proof's complete 54 light/dark mounts before
the failing keyboard acceptance step. Native capture-phase events showed:

| Theme | ArrowDown keydown | Immediate visible-item observation | Native New file focusin |
| ----- | ----------------- | ---------------------------------- | ----------------------- |
| light | 127.3 ms          | 136.5 ms, trigger still focused    | 141.0 ms                |
| dark  | 122.5 ms          | 131.5 ms, trigger still focused    | 140.4 ms                |

Base UI 1.8.0 `FloatingFocusManager` queues initial focus after layout-effect
updates and then on the next animation frame through `enqueueFocus`.
Visibility is therefore not the completion signal for initial keyboard focus.
The current compiled source artifact also exhibited the race after 54 mounts.

The proof now observes actual first-item focus within 1000 ms, then retains the
original identity assertion, ArrowDown/Enter activation and focus-return checks.
No focus is forced and no timeout is increased.

Minimization removed all 54 preceding mounts: 40 fresh Default-menu navigation
cycles across both themes reproduced nine immediate false observations and zero
settled-focus failures. A diagnostic negative control blocking only the native
first item's `focus()` failed the new predicate at 1000 ms. Existing
`menu.browser.test.tsx` already covers native refs, render callbacks, keyboard
operation and nested contracts; another shallow component test was not added.

Both the original production artifact and the fresh current artifact passed the
corrected scoped production proof: 54 mounts and all subsequent assertions.
An additional unchanged-original-proof run happened to pass, confirming the race
is nondeterministic rather than a universally failing keyboard contract.

## Toast cause and proof

The original failure screenshot shows an expanded stack: the rear Short content
is visible and the cards are separated. Native hover reproduces the exact
original final `56px` versus `65px` failure with `data-expanded=true`,
`--front-height:65px` and rear `--toast-height:56px`.
This is the native expanded layout, not evidence of broken collapsed geometry.
No cached-front-height cause was established; the sampled expected-height
assertion was deliberately retained.

The collapsed test now moves the native pointer outside this top-start viewport
and observes `data-expanded=false` before the original height/content assertions.
It tests both an ordinary initial state and a settled prehovered stack. The
prehovered case waits for native expanded height before resetting the pointer,
so it cannot accidentally pass at the beginning of the expansion animation.
The existing subsequent hover and source paint assertions remain.

The prehover regression without the pointer/state reset failed with exact
`56px` versus `65px`; the corrected test passed. Five fresh scoped runs passed
both variants (10/10). A diagnostic negative control imposing an actual
collapsed rear height of 56px still failed the retained 65px expectation.
All 12 overlay tests plus the existing three Menu tests passed: 15/15.

## Candidate basis and execution

The current fixture is isolated at
`test-results/bounded-menu-toast/menu-toast-validation`, copied from this
checkout's current source and built with direct installed Node entrypoints and
the existing configs. Original source/proofs and original compiled artifacts
remain read-only comparison inputs. Dependency links read k2tzb1f7eb6e's
`test-results/final-lock`; no install was performed. This is not a fresh
frozen-install qualification or an exact replay of full-suite order.

| Current fixture source                                 | SHA-256                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `packages/react/src/components/menu/menu.tsx`          | `d473e90cddcb17322446a9328746337e1760db041aef5a3960dfbd92d3ecd094` |
| `packages/react/src/components/toast/toast.tsx`        | `83c692ad03d7a05b07abb81afd6cd3f6f39329ea941970cda136b03dd303c3b4` |
| `packages/styles/src/components/toast/toast.styles.ts` | `b47f00c710e525a5dc64504ecf7b537305ba58a2a90c8a8efa9b5f6e61371e05` |
| `packages/storybook/stories/menu.stories.tsx`          | `3e593645e2a46bf800f020ee00b19fdefc674cc5e7d9122188a08202e054de1e` |

Runtime: Node 24.18.0; Base UI 1.8.0; React 19.3.0; StyleX 0.19.1;
Vitest 5.0.3. Browser cache:
`/Users/leosouthey/Projects/framework/lenso-ui/.delta/worktrees/ma92jy31szk2/lenso-ui/test-results/dependency-upgrade/browsers`,
Chromium/headless-shell revision 1243.

Scoped commands:

```sh
# With the supplied Node24 PATH and PLAYWRIGHT_BROWSERS_PATH:
node packages/storybook/stories/menu-toast-proof.mjs \
  test-results/bounded-menu-toast-current-static \
  /Users/leosouthey/Projects/framework/lenso-ui/.delta/worktrees/k2tzb1f7eb6e/lenso-ui/test-results/final-lock/packages/react/node_modules/playwright/index.mjs

# From the isolated fixture packages/react directory:
node node_modules/vitest/vitest.mjs run \
  src/components/modal/overlay-fidelity.test.tsx \
  src/components/menu/menu.browser.test.tsx
```

Ignored local artifacts:

- `test-results/bounded-menu-toast/menu-timing-summary.json`
- `test-results/bounded-menu-toast/menu-after54-diagnostic.log`
- `test-results/bounded-menu-toast/menu-current-diagnostic.log`
- `test-results/bounded-menu-toast/menu-fixed-current.log`
- `test-results/bounded-menu-toast/menu-fixed-original-final.log`
- `test-results/toast-pointer-red.log`
- `test-results/toast-regression-red.log`
- `test-results/toast-negative-red.log`
- `test-results/toast-stress-1.log` through `toast-stress-5.log`
- `test-results/menu-toast-final-scoped.log`

Diagnostic instrumentation exists only in ignored fixtures/probes, not product
source or committed tests. No full UI/full documentation run, publish, landing,
or unknown process termination was performed. The initial pnpm-based helper
prompted to reinstall modules and was abandoned without accepting the prompt;
builds then used direct Node entrypoints. A combined two-proof terminal window
expired during its second proof; the final original-artifact proof was rerun
alone and completed successfully.
