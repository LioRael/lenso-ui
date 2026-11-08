# SwipeActions and WheelPicker validation

Historical first-pass report. The later
[physical iOS comparison](ios-swipe-wheel-comparison-2026-11-09.md) supersedes its
remaining-device limit and the original wheel geometry/gesture presentation.

Reviewed 2026-11-08 against the current working tree. Unrelated work was retained;
no primitives component source or public API was edited.

## Delivered

SwipeActions adds logical leading/trailing action groups, native Base UI action
and reveal buttons, controlled/uncontrolled disclosure and horizontal pointer
tracking. Vertical gestures remain with browser scrolling. Cancellation restores
the accepted state. Full-swipe execution is explicitly enabled per action and
requires 80% of the row width. Closed actions are inert. Revealed actions follow
their triggers in DOM order, and Escape returns focus to the reveal control.
The application retains row activation, deletion, confirmation and undo ownership.

WheelPicker composes the existing ListBox model with browser scrolling and CSS
snap alignment. Keyboard selection follows focus, skips disabled items and stops
at the ends. Selection is centered using measured row bounds and rem geometry.
Controlled rejection restores the accepted position. Optional hidden form values
support submission and uncontrolled reset, including the reset Tab entry.

ListBox exposes optional `selectionFollowsFocus` and `loopFocus`, preserving false
and true defaults respectively. A synchronous focus re-entry guard avoids duplicate
selection callbacks. Ordinary ListBox retains focus-only arrow navigation and wrap.

## Checks

| Check                                           | Result                                                                                                                                                                                                      |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Affected oxfmt and oxlint                       | Passed                                                                                                                                                                                                      |
| UI, tokens, docs/scripts and testing typechecks | Passed                                                                                                                                                                                                      |
| UI/tokens builds and declarations               | Passed                                                                                                                                                                                                      |
| Focused DOM regressions                         | 5 passed: disclosure, controlled rejection, disabled actions, wheel selection/reset/callback count, and ordinary ListBox defaults                                                                           |
| Documentation projection regressions            | 9 passed                                                                                                                                                                                                    |
| Independent installed consumer                  | Passed public subpaths, types, browser production build and server rendering for both families                                                                                                              |
| Generated docs/contracts                        | 95 public families, 224 documents, 1,240 example graphs and 95 style maps                                                                                                                                   |
| Chromium and WebKit, light/dark, 390px viewport | Passed pointer reveal, explicit full swipe, action activation, Tab order, Escape/focus return, wheel keyboard/snap alignment, disabled options, form reset, controlled rejection and runnable Story actions |
| Chromium touch input, light appearance          | Passed canceled horizontal drag, native vertical parent scrolling, preservation of the closed state and absence of accidental action execution                                                              |
| Chromium and WebKit, 1280px viewport            | Passed logical RTL action placement, disabled controls and overflow checks                                                                                                                                  |
| Enlarged root text at 24px                      | Both engines retained the selected wheel row at the viewport center with enlarged 54px rows                                                                                                                 |
| Row activation during a swipe                   | Browser regression retained an unactivated native row button                                                                                                                                                |

The maintained browser entry is `bun run --filter @lenso/ui-docs test:swipe-wheel`.
It serves a hydrated fixture and the actual component Stories through the docs
Vite/StyleX configuration. It saves no screenshots. Separate temporary captures
were inspected at 390px in Chromium light and WebKit dark appearance.

An intermediate installed-consumer rerun found different function identities
between the barrel and the new subpaths. The output directory had a newer barrel
from a long-lived package watcher and older subpath chunks. Source changes had
added entrypoints after those watchers started. A fresh complete UI build was
used for the final installed-consumer check; unrelated watcher processes were
left untouched. Restart pre-existing package watchers when their entry inventory
changes. Docs development resolves source and does not need package watchers.

## Scoped design review

The existing Apple-inspired direction remains energy 1, rhythm 1 and motion 1.
An ordinary content surface owns the row and wheel; neither adds glass. Reveal
motion explains the row/actions relationship. Selection remains the wheel's focal
point, with a neutral center band and a fading view of neighboring options.

- Hard gate PASS in the reviewed component scope: visible reveal controls,
  labelled listboxes, no narrow-view overflow in inspected captures, working
  keyboard paths and disabled/empty presentations.
- Purpose gate PASS: row translation reveals actions, the center band identifies
  selection, and the wheel uses native scrolling rather than decorative motion.
- Liveliness PASS: the selected value and row title establish focal points;
  semantic colors and shared typography retain the established component language.
- Craftsmanship PASS for the exercised interactions: cancellation, native row
  controls, controlled rejection, form reset and focus ownership remain observable.

## Broader-check limitation

The combined DOM run completed with 14 passes and one failure. The failure is
`elastic text editing keeps press feedback without drag deformation` in
`packages/ui/test/components.dom.test.tsx:58`: the expected press scale is
greater than 1, but the observed value is 1. It reproduced when run alone. That
test directly exercises the existing glass `press` implementation, not ListBox,
SwipeActions or WheelPicker. Neither its implementation nor its expectation was
changed for this task. The wider DOM suite is therefore not reported as passing.

React Doctor reported the same workspace-wide 65/100 score and 47 existing
diagnostics as the earlier navigation work. Its score service also reported a
connection failure. This scan is not a clean baseline or proof of quality gain.

## Remaining limits

No physical iPhone/Safari run, screen-reader session, exhaustive contrast audit,
quantitative animation comparison or full docs production build was completed.
WebKit's automated run used mouse/keyboard input; native touch arbitration was
exercised in Chromium only. The wheel's browser scroll/snap behavior does not
establish native iOS inertia or cylinder rendering parity. No infinite wheel or
virtualization is provided. Application navigation gestures and dependencies
between multiple wheel columns remain application responsibilities.
