# Photos selection and editor implementation

November 6, 2026. Scope: `/en/photos` drag selection and the sample-photo editor.
This implements the next stage of the [native comparison](photos-selection-editor-native-2026-11-06.md).
That comparison records the earlier state, before these changes.

## Implemented behavior

- Drag selection snapshots the initial selection and anchors an inclusive range in
  library order. Returning toward the anchor restores items outside the new range.
  Starting on a selected item removes the range instead. Horizontal intent captures
  the pointer; initial vertical intent yields to scrolling. A frame loop updates
  the endpoint during edge scrolling. Release flushes the last endpoint and
  suppresses the trailing click; cancellation, lost capture and resize end the session.
- The editor uses the existing Tabs, Toolbar, Menu, Slider, Modal, AlertDialog and
  glass controls. Adjust, Filters and Crop have separate workspaces. A horizontal
  tool strip centers the chosen tool; the relative ruler supports pointer and
  keyboard input. Six adjustments and ten filter recipes have actual preview effects.
- Changes are grouped into undoable gestures. New changes drop the redo branch.
  Done is disabled for an unchanged draft; leaving a changed draft requires keeping
  the session or discarding it. The original source remains available when reopening.
- Crop supports moving and resizing, aspect locking, portrait/landscape presets,
  quarter rotation, horizontal flip and straightening. Preview and JPEG export use
  the same drawing function; exported dimensions update photo information.

## Acceptance evidence

All browser checks below used the running Docs development server on port 3000,
Chromium in the in-app browser. They are not production-build or WebKit receipts.

| Check                        | Observed result                                                                                                                                                                                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pointer selection, 420 × 800 | One held drag selected 3, expanded to 9, retracted to 3; edge dwell scrolled 102.5px and expanded to 15; release retained 15                                                                            |
| Relative exposure ruler      | An 80px left drag changed 0 to 40; one Undo restored 0. A later 40px drag changed 0 to 20 and focused the semantic Slider                                                                               |
| Adjustment controls          | Exposure, Brightness, Contrast, Saturation, Warmth and Tint each changed through keyboard input and restored through Undo                                                                               |
| Filters                      | All ten presets became selected; intensity 0 and Original produced the same sampled canvas hash, 3781817371                                                                                             |
| Crop geometry                | Portrait 16:9 measured 0.562284, landscape measured 1.777115; resizing a locked square retained a 0.99997 physical ratio                                                                                |
| Crop output                  | A rotated square exported and decoded at 1200 × 1200; a resized square decoded at 1188 × 1188 and photo information reported the same dimensions; reopening had Done disabled                           |
| Other controls               | Flip toggled on/off; Straighten changed 0 to 1 and Reset restored 0; six ratio buttons selected correctly; Compare original toggled with keyboard, Escape closed the menu, Reset restored a clean draft |
| Session exit                 | Keep editing retained the draft; Undo/Redo changed dirty state; Discard closed the session; unchanged Done stayed disabled                                                                              |
| Small screen, 320 × 568      | document scrollWidth = viewport width = 320; canvas 284.79 × 190; mode strip stayed inside viewport, bottom 548.06                                                                                      |
| Automated regression         | `test:photos`: 8 passing tests, 49 assertions, including final drag endpoint, vertical-scroll arbitration, range retraction, history branching and dirty cancellation                                   |
| Static checks                | Docs typecheck passed 2244 source files and 42 script files; affected oxlint/oxfmt and source interaction-boundary check passed                                                                         |

Local captures:

- [Nine-photo drag selection](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-drag-nine.png)
- [Adjust](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-editor-adjust-final.png)
- [Filters](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-editor-filters-final.png)
- [Crop](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-editor-crop-final.png)
- [320px layout](/Users/leosouthey/.codex/visualizations/2026/11/04/01a1a5c1-dd6f-72e0-b5e7-a18a1332b6bb/photos-editor-narrow-final.png)

## Deliberate limits

The six adjustments and CSS/canvas filter recipes approximate effects; they do not
reproduce Apple's color pipeline. Auto enhancement, the full native adjustment
catalogue, perspective correction and crop-image pinch/rebound are not implemented.
Aspect-preset UI selection is local to the editor session; crop geometry persists.
The reference photos and demo content differ, so these captures are not pixel-diff
acceptance against the phone.

Chromium touch dispatch was unavailable. Mouse gestures, keyboard behavior and DOM
tests passed; real Safari/iPhone browser touch arbitration, tactile feel and frame
performance remain unverified. No FPS claim is made. The temporary viewport and
touch-emulation setting were restored. No phone photos were modified in this stage.
No production build, merge, CI run or publication was performed.

React Doctor reported 64/100 over the broader changed worktree, including an existing
ThemeScope cleanup finding. This is not a clean whole-repository or all-new-files
qualification; focused lint, type and interaction checks above are the receipts.

## Scoped antislop delivery gate

Direction: a Photos editor reconstruction for people browsing sample photos, using
the inspected iOS layout. ENERGY 1 / RHYTHM 1 / MOTION 2. These dials preserve a
quiet photographic workspace, repeated tool geometry and movement tied to input.
This gate covers this implemented surface and the tested states, not every Photos
page, the complete iOS feature set or untested touch platforms.

- R-02 PASS: edited UI labels use no decorative em dash.
- R-03 PASS: the 320px browser geometry above has no horizontal document overflow.
- R-17, R-18 PASS: no statistics or testimonials were added.
- R-23 PASS: existing sample photos are retained; control glyphs serve the requested editor reconstruction; no new photographic assets or navigation hierarchy were invented.
- R-24 PASS: no navigation links were added; the three modes are real Tabs panels.
- R-25 PASS: enabled editor text uses white, #c7c7cc or #ffd60a over black/#1c1c1e; even #c7c7cc over #1c1c1e exceeds 10:1. Disabled controls retain their disabled treatment. This does not certify contrast across the entire existing demo.
- R-26 PASS: the implemented controls have actual handlers; the recorded checks cover tools, presets, ratios, flip, rotate, straighten/reset, Undo/Redo, comparison, save and exit choices. Native features outside scope are listed above rather than presented as working controls.
- R-27 PASS: source loading, unavailable-photo and save-error states exist in the preview/editor source; save exposes loading and prevents duplicate edits. Error paths were inspected, not induced on the user's phone.
- R-28 PASS: no FAQ exists on this surface.
- R-32 PASS: semantic Sliders support arrows/Home/End, crop controls support arrows, Tabs and menu retain native component contracts; browser checks exercised keyboard adjustment, menu comparison/Escape and Undo, and visible focus was inspected.
- R-33 PASS: behavior and presentation live in authored React/StyleX source; browser input was used only for verification, without retained page patches.
- R-34 PASS: this native-reference editor intentionally owns a dark ThemeScope; it does not depend on the outer page appearance. Outer-page theme switching is unchanged and was not requalified here.
- R-35 PASS: the development app ran and the implemented control families were exercised as recorded above; automated checks supplement those browser observations.
- R-36, R-38 PASS: no security, compliance, customer or performance claims were added; sample-photo status remains explicit.
- R-37 PASS: the user requested a native reconstruction and the prior device comparison supplies direction.
- R-01, R-07, R-13, R-22 PASS: no decorative gradients, background grids, glows or illustrations were introduced. Crop grid lines express geometry.
- R-04 PASS: adjustment/crop glyphs identify photographic operations; existing Gravity icons are reused for standard actions.
- R-06 PASS: system typography follows the native reference and keeps attention on the image; no display monospace or tracked headings were introduced.
- R-08, R-09 PASS: no decorative arrows or promotional badges were added.
- R-10, R-12 PASS: glass is confined to the action/tool chrome and mode control requested by the reference; crop masking communicates the exported region. No floating card composition was added.
- R-14, R-19 PASS: repeated tool dimensions communicate peer controls; centering and ruler movement correspond to user selection, with reduced-motion centering respected.
- Liveliness PASS: the image is the focal point; workspace whitespace separates photograph and editing controls; yellow marks active modifications and completion; repeated rings, ruler and thumbnail strip establish the native editing motif, consistent with the declared dials.
- C-1, C-2, C-3 PASS: major choices follow the recorded native task structure and functional controls; no template sections or empty actions were added.
- C-4 PASS: the bounded keyboard and 320/420px states above were checked; platform limits remain explicit rather than claimed as accepted.
- C-5 PASS: claims are restricted to observed results and scoped test outputs.
- R-05, R-11, R-15, R-16 PASS: no marketing template or generic CTA copy; circles indicate tools, rectangles indicate image previews, and glass capsules group actions.
- R-20, R-21, R-30 PASS: the photo workspace, quiet dark surface and native visual identity are the user's explicit reconstruction direction.
- R-29, R-31 PASS: black/deep gray suppress chrome, neutral text preserves hierarchy, yellow indicates changed/active state; two toolbar rows separate session actions from tools; system type matches the platform; full-width photo and centered tool spacing make room for editing rather than decoration.
