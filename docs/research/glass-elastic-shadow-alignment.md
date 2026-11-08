# Glass shadow input and elastic alignment

Date: 2026-11-08

Reference: [onlymoein/liquidglass 0.11.2](https://github.com/onlymoein/liquidglass/tree/89f8b7360a4501940aba9b838710bceb56b23601), commit `89f8b7360a4501940aba9b838710bceb56b23601`. The local reference checkout is clean at that commit. This follows the [first alignment pass](glass-reference-alignment.md).

## Changes

The remaining large fusion face-color difference came primarily from the reference shadow contributing to the material input. Disabling only its shadow moves dark clear pink group centers from `[208,90,151]` to `[217,93,158]`; the earlier Lenso center was `[217,92,157]`. This controlled intervention is stronger evidence than inferring the cause from two final screenshots.

Compatible groups now draw a live vector shadow beneath the material. Copied backgrounds receive a synchronized copy of that pure shadow before blur, refraction and tone. Its position is measured relative to the current optical input plane, including a retained plane during delayed decoding. The shadow never contains rendered glass, so this introduces no recursive glass sampling. It uses the existing 4px offset, 4px blur and .03/.05 light/dark opacity. The contour canvas now owns only the rim, preventing duplicate shadow painting.

The linear group material was already ineligible for the optional standalone GPU material compositor. Copies with this additional input retain complete native filter composition; worker displacement acceleration remains. Other material roles retain their previous backend selection. Changing into/out of a compatible group retires and recreates the input owner; reduced motion and unmount remove its copies. Generated optical SVG writes are excluded from fusion geometry observation, as they already are from backdrop invalidation.

GlassButton and GlassToggleButton no longer override shared pointer-specific enlargement with a size-only 12/14/20px value. All sizes now grow 6 CSS px on the longer side for mouse input, 16px for touch/pen. Standalone reference press/release spring constants remain. Fusion mouse release stays critically damped at 230/31; fusion touch now returns faster at 342/37 instead of using the mouse return. This intentional difference preserves the contact contour rather than repeatedly reopening its neck during rebound.

Held mouse drags keep their rubber-band deformation outside the initial hit box. Missing buttons, lost capture, cancellation, window blur and document hiding still release the gesture. Native activation remains unchanged: dragging outside does not click; keyboard Space activates once. Re-pressing during return normalizes the current presentation bounds back to resting geometry and carries spring velocity forward. Reduced motion keeps scale/translation neutral, including a live preference change during a gesture; pressed lighting remains available.

## Comparison

The same production reference fixture and 144-page matrix were rerun: both engines, CSS/image backgrounds, light/dark, three transparency values, gray/pink/stripes, and 60/90/120px shapes. All pages had zero JavaScript page errors.

Chromium maximum center-channel difference on the 0–255 scale:

| Surface/background               | First alignment |  This pass |
| -------------------------------- | --------------: | ---------: |
| Group, flat                      |               9 | 2.51171875 |
| Group, stripes                   |               3 |      1.125 |
| Standalone Glass/button, flat    |          5.6875 |     5.6875 |
| Standalone Glass/button, stripes |          4.9375 |     4.9375 |

These are spatial center samples, not a whole-image perceptual score. In particular, neck pixels over stripes can remain very different: Lenso retains refraction through the connecting neck, while the reference group uses a mostly CSS material surface. Removing refraction to match those pixels would violate this task's material/fusion constraint. The smoother higher-density contour and continuous neck lighting also remain intentional differences.

The 60px elastic fixture settles at 66px for mouse and 76px for touch in both libraries and engines. On a rapid second press, Lenso retains 66/76px; the reference's second target becomes approximately 65.5/73px because it measures an already enlarged presentation. Standalone touch keeps the reference rebound; fused touch returns to 60px without undershooting. This is purposeful alignment of input feel, not a claim that every trajectory is identical.

## Validation

| Check                       | Evidence/result                                                                                                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Production reference matrix | 144 pages, zero page errors; raw samples and screenshots archived                                                                                                             |
| Real docs examples          | Small/Medium/Large, mouse/touch and interrupted presses in Chromium/WebKit; native drag-out cancellation, Space activation, reduced motion; toggle touch and native selection |
| Touch injection             | Actual Chromium touch-start/held/end injection in both themes; ordinary held-center samples remain within 3 channels of reference                                             |
| Fusion continuity           | Eight cases across both engines; stationary pending-field difference 0 in all; maximum settled difference .398; newly exposed face .313 Chromium/.280 WebKit                  |
| Material consistency        | 16 states; maximum neck/body difference 1                                                                                                                                     |
| Group delivery/ownership    | Both themes and engines; linear size-1 recipe, no standalone inner shade, two shadow inputs, padded contour, zero contour redraws and shadow mutations over 500ms idle        |
| Material-role changes       | iOS 27 to iOS 26 to iOS 27 retires/restores the two shadow copies; reduced motion removes shadow source/inputs; forced colors suppress interaction shadows                    |
| Mobile                      | 390px viewport/document width in both engines; no page errors; worker delivery retained                                                                                       |
| Unit/DOM/component tests    | 31 glass unit, 23 glass DOM, 16 affected component tests passed                                                                                                               |
| Build/integration           | Package production build, affected format/lint/types, installed-consumer exports/types/SSR/assets and canonical contract generation                                           |

The continuity values are small but not all zero after settling, and newly exposed pixels differ more than in the first pass because the moving shadow now legitimately participates in the input. Pending-field stationary continuity remains zero. These tests do not establish universal flicker freedom.

The maintained browser tests are `apps/docs/test/glass-elastic.mjs`, `glass-group-alignment.mjs`, `glass-fusion-continuity.mjs` and `glass-material-consistency.mjs`. Documentation size examples must be opened through their real disclosure before measurement: closed disclosures can retain stale descendant bounds. Synthetic pointer samples alone are not evidence that a hidden example can receive native input. Native mouse/keyboard checks run after opening the disclosure; toggle probes wait for material attachment after navigation.

Another 14 existing shared menu/tab-control DOM tests passed. The matrix and trajectory captures preceded the final reduced-motion query correction, which changes neither normal-motion targets nor optical math. Final docs regressions use the corrected source and wait for the emulated media preference to take effect before dispatching input.

The existing preview temporarily stopped answering during package/contract rebuilding. It recovered on the same process and port; final browser regressions were rerun after readiness returned. The consumer check also caught a stale packaged notice after the attribution edit. Rebuilding refreshed it, and the consumer check passed.

## Design review and limits

This is feedback motion on existing controls. It uses the shared interruptible spring and scale/translate channels, with pointer-specific strength and stationary reduced-motion feedback. The established page layout, typography, accent and material hierarchy remain. The reference's glass/shadow treatment is explicitly requested; no new decorative sections or assets were introduced.

- Hard gate PASS for this change: real production build and native interaction checks; mobile width 390; no new copy, statistics, links or controls.
- Purpose gate PASS: enlargement confirms a held gesture; the shadow is the verified reference material input; no unrelated effects added.
- Liveliness PASS within existing design: existing Apple-inspired material motif and accent retained; motion remains input-dependent, with a stationary reduced-motion mode.
- Craftsmanship PASS within tested states: interrupted gestures preserve their target, native activation/selection works, both themes render, generated inputs become idle and are cleaned up. This is not a full-page contrast certification.

CPU optimization remains paused and was not benchmarked. No total-CPU improvement or acceptance is claimed. WebKit reference backdrop calibration remains unresolved, so its reference pixels are not used for parity claims. Real Safari/iOS, other GPUs, arbitrary rotated ancestors, translucent marked sources and full contrast acceptance remain untested. Standalone fitted materials retain the measured differences above; this is not complete reference or Apple-native parity.

Artifacts: `/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-elastic-shadow-alignment/`. The archive contains scripts, final fixture source, source snapshots, raw matrix/motion/touch results, screenshots and logs. Scratch scripts use absolute local paths and require path remapping elsewhere. Temporary reference fixture servers are stopped after verification; the existing docs preview on port 4337 remains running.
