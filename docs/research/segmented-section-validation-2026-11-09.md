# SegmentedControl and SectionIndex validation

Date: November 9, 2026.

This records the initial component batch. The subsequent appearance and motion
implementation is documented in [SegmentedControl/Tabs unification](segmented-tabs-unification-2026-11-09.md).
The original 44px geometry and missing held lens described below are historical.

## Delivered behavior

SegmentedControl composes Base UI RadioGroup/Radio. It preserves native radio
navigation, change details/cancellation, disabled/read-only states, refs, render
composition and form inputs. A small reset adapter restores the uncontrolled
default after delegated reset handlers have had a chance to cancel the event.
The ordinary track uses Lenso's existing selected-segment paint in both themes,
equal flexible segments, wrapping labels and 44px minimum targets. Empty options
display a localizable label. The upstream held glass lens and drag model are
outside this version; this is not a new name for Tabs.

SectionIndex composes native fragment links in a labelled nav, with one enabled
Tab stop. Up/Down/Home/End move focus only; Enter/click navigate. Pointer scrubbing
activates the nearest enabled entry. The narrow 44px strip owns its touch gestures;
adjacent content stays natively scrollable. Real link dragging is disabled,
child-to-parent capture transfer is preserved, and the generated pointer click
after a scrub is suppressed without swallowing a subsequent keyboard activation.
Current-location markers may be controlled by application scroll-spy state.

Public root/subpath exports, StyleX subpaths, source examples, interactive Stories,
English/Chinese documentation and migration notes accompany the implementation.
The workspace's concurrent directory migration is respected: UI source now lives
under `packages/ui`, styles under `packages/tokens`, component tests under
`packages/ui/test` and consumer checks under `tests/consumer`.

## Findings repaired during verification

- A native reset listener's microtask could run before React's delegated onReset.
  Waiting until the next task preserves canceled resets in a real browser.
- Native anchor dragging canceled desktop scrubbing. Explicit `draggable=false`
  allows the index gesture to retain pointer ownership.
- Grouped-secondary paint was indistinguishable from the track in dark mode.
  The shared selected-segment paint restores a visible selected surface.
- The small index letters use semantic link color mixed with primary ink.
  Rendered default selected-surface contrast is checked against 4.5:1.
- Consumer tests were adapted to renamed package folders and canonical temporary
  paths, retaining the assertion that imports resolve inside the installation.

## Evidence

| Check                    | Result and scope                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused DOM regressions  | 4 cases, 17 assertions: native form/reset, controlled rejection/read-only, index focus-only keys, capture transfer/cancel/release-click suppression.              |
| Browser fixture          | Chromium and WebKit, light/dark, 390×844; keyboard, form/reset/canceled reset, rejected values, index fragments, pointer drag and disabled states.                |
| Touch fixture            | Chromium touch events: drag to another index entry, correct location and exactly one activation without a release duplicate. This is not a physical-device check. |
| Adaptation               | RTL selection, reduced motion, 320px width with a 24px root font, minimum segment hit height and no document overflow.                                            |
| Visual checks            | Selected segment remains visibly distinct from the composited track in both themes; default selected index text meets 4.5:1. Matching screenshots reviewed.       |
| Types and distribution   | UI/token/docs types; token/UI builds; isolated installed-consumer import resolution, types, SSR and production assets passed.                                     |
| Documentation projection | Existing 9 projection regressions passed.                                                                                                                         |

Seven producer regressions also passed, including source delivery for an unstyled
family without inventing a style map. Both new Stories operated on English/Chinese documentation pages in
Chromium/WebKit at 390px: selection, anchor scrolling and page-width checks passed.
The generated contract includes both style maps and implementation graphs;
unstyled compositions retain source without an invented style-map requirement.

Run `node apps/docs/test/segmented-section.mjs` for the maintained browser matrix
and the focused DOM test with `tests/setup/dom.ts`. The installed-consumer check
is `tests/consumer/installed-consumer.test.ts`. Local screenshots are under
`output/playwright/segmented-section/`; they are evidence artifacts, not published
documentation assets.

## Scoped design review

Direction stays with the existing ordinary content surfaces and semantic ink.
ENERGY 1 / RHYTHM 1 / MOTION 1. Selection and native navigation carry the feedback;
no decorative material or unrelated animation was added.

- Hard gate PASS in the exercised fixture: real actions/links, focus-only keys,
  visible focus rules, disabled/empty cases, both themes and narrow layout.
- Purpose gate PASS: selected paint communicates a value; the narrow index owns
  scrubbing solely to navigate existing headings.
- Liveliness PASS within this control scope: selection and location feedback
  respond to input; reduced motion retains the same complete operation.
- Craftsmanship PASS within the recorded scope: native semantics and editing
  boundaries are retained, browser behavior and distribution are verified.

## Limits

No physical iPhone, native screenshot parity, native held-lens animation,
screen-reader session, exhaustive theme/contrast audit or full docs production
export was established in this batch. Fixture results are development-browser
evidence; installed-consumer checks cover emitted package delivery. The workspace
React Doctor changed scan skipped the newly moved UI package and therefore does
not establish a new-component score. No commit, landing, release or deployment
is claimed.
