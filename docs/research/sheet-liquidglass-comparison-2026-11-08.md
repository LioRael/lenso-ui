# Sheet comparison with liquidglass

Reviewed 2026-11-08. This is a source and browser comparison, not native iOS parity acceptance.

## Result

Retain Lenso's three-stop configuration and Base UI gesture ownership. The reference provides a useful spring implementation, but the current evidence does not justify replacing Lenso's animation or gesture implementation wholesale.

The reference only accepts `medium` and `large`. Lenso defaults to two stops too; the documentation's three-stop configuration explicitly adds the attached low stop. Its floating middle and solid upper stop are intentional Web behavior, not a claim that iOS universally uses three stops.

The most concrete correctness finding was an invisible expand/collapse action caused by a shared material selector. A fix was implemented and verified, but the shared source was independently restored to the old rule twice during this investigation. To avoid overwriting concurrent work repeatedly, the final fix and its browser regression are delivered as an isolated patch, not left applied to the shared files.

- [Applicable patch](../../output/playwright/sheet-comparison-2026-11-08/sheet-expand-visibility.patch)
- [Motion recording: left Lenso, right liquidglass](../../output/playwright/sheet-comparison-2026-11-08/sheet-motion-comparison.mp4)
- [Lenso recording](../../output/playwright/sheet-comparison-2026-11-08/lenso-motion.mp4)
- [Reference recording](../../output/playwright/sheet-comparison-2026-11-08/reference-motion.mp4)

The recordings demonstrate behavior. The Lenso clip uses header buttons and interruption; the reference clip uses touch drags and cancellation. They have different content/backgrounds and are not synchronized benchmarks or a color/pixel comparison. The Lenso side freezes after its shorter clip ends.

## Sources

Reference commit: `89f8b7360a4501940aba9b838710bceb56b23601`.

- [Reference Sheet](https://github.com/onlymoein/liquidglass/blob/89f8b7360a4501940aba9b838710bceb56b23601/src/sheet.tsx)
- [Reference spring](https://github.com/onlymoein/liquidglass/blob/89f8b7360a4501940aba9b838710bceb56b23601/src/internal/spring.ts)
- [Reference parity claims](https://github.com/onlymoein/liquidglass/tree/89f8b7360a4501940aba9b838710bceb56b23601#how-close-it-is-to-ios-27)
- [Lenso composition](../../apps/docs/src/stories/sheet-demo.tsx)
- [Lenso presentation interpolation](../../packages/ui/src/components/sheet/presentation.ts)
- [Lenso position tracking](../../packages/ui/src/components/sheet/track-presentation.ts)
- [Lenso styles](../../packages/tokens/src/components/sheet/sheet.styles.ts)

The reference's parity motion script currently exercises button pressing and menu opening. Its native fixture also contains a medium/large sheet scene, and its Sheet source describes measurements, but the README does not establish a quantified Sheet-motion error or three-stop acceptance.

## Geometry

Both examples were exercised at a 393 × 852 CSS-pixel viewport. Measurements below are settled visible-surface bounds from the browser, rounded to three decimals.

| Implementation / stop | Left |     Top | Width |  Height |  Bottom |
| --------------------- | ---: | ------: | ----: | ------: | ------: |
| Lenso low             |    0 |     639 |   393 |     213 |     852 |
| Lenso middle          |    6 | 404.700 |   381 | 441.297 | 845.997 |
| Lenso large           |    0 |      62 |   393 |     790 |     852 |
| Reference medium      |    8 | 404.375 |   377 | 439.625 |     844 |
| Reference large       |    0 |      67 |   393 |     785 |     852 |

Despite their different fractional-height constants, the visible middle-sheet top edges are almost identical at this viewport. Lenso's floating sheet is 4px wider, has a smaller edge gap, and uses larger lower corners. Neither upper stop fills the entire phone viewport.

Lenso's three-stop configuration uses `[0.25, 0.525, 1]`, with the first and last edge-attached. The lower stop remains glass; the upper stop becomes solid. The reference has no equivalent low stop or arbitrary-height public detent API.

## Motion and gestures

| Area                        | Lenso                                                                                       | Reference                                      |
| --------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Snap motion                 | Registered CSS position property; 500ms adaptive transition using the existing fluid easing | Analytic spring, stiffness 700 / damping 65    |
| Shape and material          | Position-dependent smoothstep between stops                                                 | Linear interpolation above medium              |
| Direct manipulation         | Base UI touch/scroll arbitration                                                            | Pointer handlers attached to the handle only   |
| Release selection           | Base UI velocity-aware snap selection                                                       | Height plus 0.15s velocity projection          |
| Overshooting the upper edge | Base UI square-root resistance                                                              | One-third displacement resistance              |
| Cancellation                | Lenso rejects canceled swipe state changes                                                  | `pointercancel` uses ordinary release handling |

The reference uses a real spring, but its drag updates use the spring's instant mode, which resets its internal velocity. Finger velocity influences target selection; it is not supplied as the spring's release velocity. A spring label alone therefore does not establish continuous velocity handoff or a better release feel.

Observed Lenso behavior:

- Low-to-middle and middle-to-large touch drags reached the expected stops.
- Large-to-low button activation traversed a floating intermediate shape and settled attached at the bottom.
- Reversing an expansion settled at the new target without changing the logical three-stop sequence.
- Pulling beyond the upper edge resisted movement and returned to the upper stop.
- A multi-move downward touch drag was canceled while visibly moving: the sheet returned to its original large stop. The mid-gesture surface top was approximately 203px and the final top was 62px.
- Closing restored focus to the opening button.

Observed reference behavior:

- Medium/large handle drags worked in both directions.
- Canceling a multi-move downward touch drag from large was treated as a release and selected medium. The mid-gesture top was approximately 228px and the final top approximately 404px.

These are browser-input observations, not physical-device touch acceptance. Raw frame samples include callback-order and main-thread scheduling effects; they are not compositor paint traces. A first Lenso expansion had a roughly 508ms sampling gap, and repeated runs varied. Different page backgrounds, content, development servers and recording overhead prevent a fair performance ranking from this run.

## Scroll ownership

The existing scrolling example was exercised with browser touch input at the large stop:

| Operation                                           | Content scrollTop | Sheet top |
| --------------------------------------------------- | ----------------: | --------: |
| Initial                                             |                 0 |        62 |
| Upward content drag                                 |               285 |        62 |
| Downward drag while content remains scrolled        |               200 |        62 |
| Downward drag starting at content top, then release |                 0 |   404.700 |

The content consumed scrolling until it reached its top, after which downward movement could move the sheet. The header and footer remained outside the scrolling body. This is stronger interaction coverage than testing a handle alone.

## Material and browser limits

Chromium screenshots show the intended floating-glass middle and solid large surface. The visibility fix restores the blue expand/collapse button.

The WebKit screenshots from this environment show a materially weaker result: background text remains sharply visible through the middle sheet. The reference's WebKit dark screenshot also shows sharp background content, despite a computed blur filter. This may include a rendering/backend limitation of the tested WebKit environment; it is not evidence that only Lenso has the problem. Neither implementation receives WebKit material-appearance acceptance from this run. Confirm in actual Safari before attributing it to a specific owning source or choosing a fallback change.

- [Lenso Chromium middle, corrected action](../../output/playwright/sheet-comparison-2026-11-08/lenso-medium-light.png)
- [Lenso WebKit dark middle](../../output/playwright/sheet-comparison-2026-11-08/webkit-medium-dark.png)
- [Reference WebKit dark middle](../../output/playwright/sheet-comparison-2026-11-08/webkit-reference-medium-dark.png)

## Visibility fix

The old opacity condition contains a comma outside its `:is(...)`. Compilation appends `::after` only to the final selector branch, leaving the first branch able to match the entire filtered button. The observed button had computed opacity `0` while remaining focusable/clickable.

The patch groups the complete condition inside one `:is(...)`, so `::after` applies to every branch. Production-mode StyleX compilation was checked in Chromium and WebKit with ordinary, filtered, foreground-rim, disabled and ARIA-disabled buttons. Every button root retained opacity `1`; only the intended contour changed opacity.

The added browser check waits for hydration/network idle and, in Chromium, installation of the material filter before asserting visibility. Existing DOM-only motion tests do not render compiled CSS and cannot catch this failure.

No public API or consumer migration is required. No Sheet motion parameters are changed by the patch.

## Validation and final delivery state

| Check                                                                     | Result                                                                                                                      |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Affected format and lint checks                                           | Passed while the fix was applied                                                                                            |
| Tokens typecheck                                                          | Passed                                                                                                                      |
| Docs script typecheck                                                     | Passed                                                                                                                      |
| Sheet presentation tests                                                  | 3 passed                                                                                                                    |
| Sheet motion DOM tests                                                    | 4 passed                                                                                                                    |
| Chromium Sheet touch, interruption, scroll and focus checks               | Completed                                                                                                                   |
| WebKit Sheet bounds, actions, light/dark states, reduced motion and focus | Passed the scoped assertions; material appearance remains unresolved                                                        |
| WebKit desktop / RTL / reduced-motion combination                         | Scoped assertions passed at 1280 × 900                                                                                      |
| Production-mode compiled material selector fixture                        | Passed in Chromium and WebKit                                                                                               |
| New maintained Chromium Sheet visibility regression                       | Passed while the corrected rule was present                                                                                 |
| Complete docs browser suite                                               | Failed later at the existing header-background assertion: “The soft edge needs a header surface behind navigation controls” |
| Browser suite with the new Sheet block omitted                            | Reproduced the same header-background failure                                                                               |
| Patch applicability against shared files                                  | `git apply --check` passed at delivery preparation                                                                          |

The complete docs suite did not finish and did not reach its WebKit pass. The separate scoped WebKit checks are not a substitute for that suite. No production docs build, native iOS/Safari device run, screen-reader run, quantitative contrast audit or performance acceptance was completed.

The shared source was changed concurrently during validation. The final deliverable is the report plus the applicable patch and evidence. The temporary browser-regression block was removed from the shared script after being saved in the patch. The material fix is not claimed to remain applied in the shared checkout. Existing unrelated source changes were retained.

Next priorities are to resolve the WebKit/Safari material evidence, then measure spring release behavior against a native recording on matched content. Keep the three stops and current Base UI gesture contracts while evaluating any motion change.
