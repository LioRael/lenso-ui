# Photos overlay corrections

November 6, 2026. This record supersedes the editor's centered discard alert
described in the earlier implementation record. Scope: discard confirmation,
photo-detail options and their local sample-library operations.

## Native observation and cause

Inspected Photos on the user's iPhone 15 Pro Max, iOS 27.2. Opened a static photo's
More menu. Its first row contains Copy, Duplicate and Hide, followed by separated
slideshow, Add to and Adjust Information sections. The latter entries disclose
further actions. The expanded surface overlaps the More button.

Entered editing, rotated its temporary preview, then pressed Cancel. Native Photos
displayed a compact glass sheet near the upper-left controls, with a question and
one destructive action. It did not show a centered two-button alert, explanatory
paragraph, dimmed screen or explicit Keep Editing action. Discarded the temporary
rotation, returned to the library and released the phone. No photo was saved,
copied, hidden, duplicated or deleted on the phone.

The demo's detail options used Popover with ordinary buttons. That bypassed the
existing Menu presentation controller, whose `morphTrigger` defaults to true.
Changing an animation flag on that Popover could not activate Menu's morph.

## Corrections

- The editor composes the existing ActionSheet with an undimmed backdrop, upper-left
  placement, compact title and one destructive action. Its Cancel control hides while
  the sheet is open. Outside press and Escape preserve the draft; Escape restores
  focus to Cancel. Initial focus goes to the panel rather than the destructive action.
- Detail options now compose Menu, ActionGroup, Action, Separator and native
  SubmenuRoot parts. The root explicitly enables morphTrigger, retaining shared
  opening, closing, reversal, placement, focus and unmount ownership.
- Copy writes an actual PNG to the clipboard. Duplicate creates an independent
  sample-library entry, cloning an existing edited bitmap URL when needed. Hide
  offers confirmation and an Undo Hide action. Add to updates the sample album.
  Slideshow advances through photos and has an explicit stop action.
- Adjust Information opens a submenu. Caption editing uses the existing information
  sheet. Date/time and location actions are disabled with explanations because these
  sample assets have no supplied capture metadata; those editors remain unimplemented.
- Viewer left/right navigation ignores events inside menu/action-sheet content, so
  menu keyboard input cannot also switch the underlying photo. Status feedback is
  tied to its source photo and appears once when the share popup is open.

No shared component API or primitives source changed in this iteration.

## Verification

| Surface/check               | Evidence                                                                                                                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Detail menu, light and dark | Running Chromium Docs dev preview, 420 × 800; both glass surfaces and grouped actions inspected                                                                                                     |
| Open morph                  | 36 requestAnimationFrame samples: shell progressed from trigger-size scale 0.176 × 0.184874 through intermediate transforms to its full size; trigger opacity returned the presentation to the menu |
| Close morph                 | 40 samples, 21 with intermediate shell transforms; popup absent at the end; focus returned to Photo options                                                                                         |
| Placement, 320 × 568        | Menu bounds x=54..304, width 250; confirmation x=10..248, y=58, height 125; neither exceeded the viewport                                                                                           |
| Discard confirmation        | Vivid draft survived Escape and an outside press; Discard returned to the viewer; clean Cancel closed directly in the DOM regression                                                                |
| Copy/Duplicate/Hide         | Browser showed Photo copied; duplicate increased 24 to 25; hiding reduced the visible set to 24; Undo Hide restored 25                                                                              |
| Submenus                    | Added a photo to City; opened Adjust Information and Edit Caption, then closed information back to the options trigger                                                                              |
| Slideshow                   | Started from At the table, observed later photos advancing, then stopped and restored normal controls                                                                                               |
| Regression                  | 9 tests, 57 assertions; new test catches replacement with a non-Menu surface, missing morph glyph/action grouping and duplicate callback dispatch                                                   |
| Static checks               | Affected oxfmt/oxlint, Docs typecheck and source interaction-boundary check passed                                                                                                                  |

Frame samples prove presentation state progression, not native spring constants,
frame rate or touch performance. Browser checks used development output, not a
production build. Safari/iPhone web acceptance remains outstanding. Native and demo
captures use different photos and appearances; no pixel-equivalence claim is made.
The editor retains its earlier dark ThemeScope; matching its whole appearance to
native Photos in every mode is outside this correction.

React Doctor again reported 64/100 for the broader dirty worktree and the existing
ThemeScope cleanup finding. It is not a clean repository receipt. The initial
invocation encountered the workspace npm override conflict; rerunning from `/tmp`
against the checkout completed the scan without changing package configuration.

Temporary browser duplicates, album additions and hidden state were reset by
reloading the agent's demo tab. Default viewport and appearance were restored.
No merge, publication or deployment was requested or performed.

Captures and raw frame observations:

- [Final detail menu](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-viewer-menu-native-layout.png)
- [Dark menu before the final information-submenu label change](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-viewer-menu-dark.png)
- [Discard confirmation](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-discard-native-panel.png)
- [Opening and closing frame state](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-menu-morph-frames.json)

## Scoped antislop gate

Design read: native Photos overlay reconstruction for sample-photo browsing and
editing, ENERGY 1 / RHYTHM 1 / MOTION 2. This is a bounded incremental gate,
continuing the [earlier gate](photos-editing-implementation-2026-11-06.md), not
approval of every existing demo page or complete native parity.

- R-02 PASS: new interface labels contain no decorative em dash.
- R-03 PASS: measured menu and confirmation bounds fit the 320px viewport.
- R-17/R-18/R-23/R-36/R-38 PASS: retained sample photos; no invented statistics, testimonials, assets or performance claims; copying and hiding apply to the sample demo only.
- R-24/R-26 PASS: no new navigation links; available menu actions have actual handlers and were exercised; unavailable capture metadata actions are explicitly disabled.
- R-25 PASS: enabled menu and confirmation labels use existing semantic foreground/material tokens; white menu text and the red destructive label were inspected on dark material, with inherited accessible/opaque-material handling retained. No whole-app contrast certification is claimed.
- R-27 PASS: clipboard and duplication failures expose feedback; inherited photo loading/error handling remains intact. Failure messages are implementation-reviewed, not a claim that every browser permission denial was induced.
- R-28 PASS: no FAQ was added.
- R-32 PASS: native component contracts retain keyboard navigation and dismissal; Escape restored Cancel/options focus, and initial confirmation focus avoided the destructive action.
- R-33/R-35 PASS: changes live in React/StyleX source; running dev UI, click-through, frame observations and regression outputs supply acceptance evidence.
- R-34 PASS: light/dark menu surfaces were inspected; confirmation inherits the editor's existing dark scope. Whole-editor appearance parity remains an explicit limit.
- R-37 PASS: the user's requested native reference was inspected before selecting the overlay parts.
- R-01/R-04/R-06/R-07/R-08/R-09 PASS: no decorative gradients, grids, arrows or badges added; standard photographic action icons and system typography express the observed operations; chevrons disclose actual submenus.
- R-10/R-12/R-13/R-14/R-19/R-22 PASS: glass separates floating controls from the photograph; separators express action groups; motion connects source button and popup; no decorative cards, shadows, glows or illustrations were introduced.
- Liveliness PASS: the photograph remains the focal point; repeated action geometry and compact glass surfaces follow the reference; red is reserved for the destructive confirmation; motion follows input and retains the shared reduced-motion handling.
- C-1/C-2/C-3/C-5 PASS: layout choices follow the observed task, handlers have real outcomes, and claims are limited to recorded observations.
- C-4 PASS: tested 320/420px overlay states and keyboard dismissal work; untested platforms remain listed above.
- R-05/R-11/R-15/R-16/R-20/R-21/R-29/R-30/R-31 PASS: no template sections, promotional copy or invented palette; capsules group actions and the compact rounded panel follows the user-requested native reconstruction. Placement, typography and material each preserve the source-control relationship and readable photographic context.
