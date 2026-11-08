# SwipeActions and WheelPicker on physical iOS

## Device and method

Compared on iPhone 15 Pro Max, iOS 27.2, 430×932pt display with 1290×2796px
captures. The native reference was built with Xcode 27.2 and installed on that
phone. Its [source](fixtures/ios-controls-probe/Probe.swift) uses standard
UITableView contextual actions and an uncustomized UIPickerView with synthetic
labels/values. Theme and implementation switches compare native and WKWebView
states in the same app. Actual Safari was checked separately.

The Web fixture is `apps/docs/test/ios-controls.html`, served through the source
docs Vite/StyleX configuration. It uses the real components and the same three
demo labels, 68pt comparison rows and 60 numeric wheel options starting at 15.
The native picker frame is 240×216pt. The Web wheel is placed at the same origin.
No user messages, timers, alarms or cities were edited/deleted. The clean probe
remains installed; automation ownership was released after verification.

## Reproduced problems and changes

1. Slow drags selected row/wheel text and opened iOS Copy/Look Up/Translate,
   preventing the intended control gesture. Non-editable content now suppresses
   selection/callout. Native editors restore text behavior, and a scoped
   selectstart handler excludes inputs, textareas, selects and editable hosts.
   Real-device input selection and Copy still worked after the change.
2. A 110pt horizontal drag delivered pointerdown, 37 pointermoves and pointerup,
   without pointercancel, yet did not reveal actions. Touch implicitly captured
   the initial child; transferring capture to the root bubbled the child's
   lostpointercapture into the root cancellation handler. The handler now
   cancels only when the root itself loses capture. Device telemetry and an
   actual successful touch reveal verify the fix; mouse-only tests did not catch it.
3. Distance-only release could not distinguish native slow and fast short swipes.
   Recent velocity now projects release by 150ms, with velocity discarded after
   a 100ms pause. These are Lenso choices matching the sampled outcomes, not
   native spring constants. Full-swipe execution still requires explicit opt-in
   and actual travel across 80% of the row, rather than projected travel.
4. Full-height rectangular actions now use inset rounded shapes. The measured
   68pt-row reference has approximately 63pt-wide, 59pt-high actions, with 10pt
   gap/edge spacing. Lenso uses 4.5px vertical insets, 63px minimum width and 16px
   corners. Destructive/tint actions have white text on solid fills; neutral
   labels retain readable semantic foregrounds. Fill choices preserve Web
   legibility rather than claiming exact system-color equivalence.
5. The flat 180px wheel is now a 216px viewport with 32px slots, a 34px center
   band and 9px band insets at a 16px root font. Labels project onto a curved
   surface, compress away from the center and grow from 20px to 23px at center.
   Only decorative labels transform; scroll positions, hit ownership, keyboard
   behavior and explicit accessible names remain in the existing ListBox model.
   Quaternary fill matches the observed light/dark band more closely.
6. Browser momentum can pass intermediate snap positions. Native scrollend is
   preferred for committing selection, with a debounce fallback for engines
   without it. This avoids intentionally cutting an active scroll on a fixed
   timer, but did not eliminate the observed native inertia difference.

## Matched device observations

| Operation                                              | Native                        | Web after changes                         |
| ------------------------------------------------------ | ----------------------------- | ----------------------------------------- |
| Wheel slow 68pt upward drag over 600ms, starting at 15 | 17                            | 17                                        |
| Wheel fast 68pt upward drag over 100ms, starting at 15 | 26 after settling             | 19 after settling                         |
| Tap next visible wheel row from 15                     | 16                            | 16                                        |
| Slow 40pt left swipe over 600ms                        | Closed                        | Closed                                    |
| Fast 40pt left swipe over 80ms                         | Open                          | Open                                      |
| Slow 110pt left swipe over 600ms                       | Open                          | Open, Actions 0 / Opened 0                |
| Input word selection and Copy                          | Native editing available      | Still available in the Web row            |
| Opening another row                                    | Closes previous row           | Independent rows remain supported         |
| Tap closed row while another is open                   | Dismisses without opening row | Application coordination remains required |

Blank space outside the native table did **not** dismiss its swipe actions in
this sample; no blanket outside-click dismissal rule was inferred.

The native and Web revealed first-row title both move out of the visible area.
Its disappearance is therefore not a demonstrated Web regression. Explicit Web
reveal buttons remain a deliberate keyboard affordance.

### Screenshot geometry

The native selection band measured 222×34pt inside the 240pt picker. Its light
fill was RGB 232/232/237 and dark fill RGB 21/21/23 in this reference. Five
numeric rows were measured around the selected 15:

| Value | Native glyph height (physical px) | Web glyph height | Native center Y (pt) | Web center Y |
| ----- | --------------------------------: | ---------------: | -------------------: | -----------: |
| 13    |                                33 |               32 |               223.33 |       223.50 |
| 14    |                                41 |               40 |               250.33 |       251.17 |
| 15    |                                51 |               51 |               282.00 |       282.67 |
| 16    |                                42 |               41 |               313.17 |       313.67 |
| 17    |                                32 |               32 |               340.17 |       341.17 |

These are screenshot-derived measurements for matching numeric content in one
device state, not a guarantee for every font, value, text size or device. The
cylinder radius and center emphasis are a Web projection calibrated to these
observations, not Apple's implementation.

## Evidence and checks

Local evidence is retained outside the repository under the chat's
`ios-swipe-wheel` visualization directory. The device operator's
`device-observations.md` identifies the exact captures and action history.
Relevant clean-reference captures are:

- `probe-native-wheel-light.png` and `probe-native-wheel-dark.png`.
- `probe-web-wheel-light-before.png`, `probe-web-wheel-text-selection-bug.png`,
  `probe-web-wheel-light-after.png` and `probe-web-wheel-dark-after.png`.
- `probe-native-swipe-light-revealed.png`, `probe-native-swipe-dark-revealed.png`,
  `probe-web-swipe-pointer-diagnostic.png`, `probe-web-swipe-light-final.png` and
  `probe-web-swipe-dark-final.png`.
- `probe-web-swipe-editor-selection-after.png` and `safari-both-after.png`.

Real-device verification covered matched WKWebView light/dark states, slow/fast
gestures, text-selection recovery, action/row counters, and native input editing.
Actual Safari separately passed row reveal and wheel interaction without a
selection callout. WKWebView evidence is not presented as Safari evidence.

The focused DOM regressions passed seven cases, including descendant capture
transfer, own-root capture loss, slow/fast release and editable selection.
The Chromium/WebKit browser matrix passed light/dark, RTL, reduced-motion,
form/reset/controlled rejection, enlarged text and a completed touch reveal
after child-to-root capture transfer. New presentation checks cover the rounded
white-label action and 216px wheel. Formatting, lint, affected type/build,
installed-consumer and generated-contract evidence accompanies final delivery.

## Limits

### Scroll-end flicker follow-up

A subsequent flicker report was reproduced in the browser fixture. Instrumenting
the scroll-position setter captured an accepted controlled wheel moving from
640px back to the previous 480px, then to 640px again: the animation-frame
reconciliation ran before React committed the new selection. A guard against
equal-position writes alone did not fix this race.

Reconciliation now runs in the layout effect after the selection commit, with
a settlement revision ensuring controlled rejection still restores the accepted
position. Already centered positions are left untouched. The new browser
regression failed before this change and passed afterward in Chromium/WebKit,
light/dark: committing an accepted scroll selection must not start another scroll
after native scroll-end. Keyboard, reset, rejection, disabled, larger-text and
RTL checks also passed, together with seven focused DOM cases, affected format,
lint, UI types and UI build. The wheel presentation and public props are unchanged.
This follow-up was browser-verified; it was not rechecked on the physical iPhone.

### Remaining physical-device limits

Fast-wheel inertia remains shorter in the Web samples: 15→19 versus native
15→26 for the sampled gesture. No custom physics was fitted from sparse screen
recordings (one stream was approximately 2.4fps). Pointer telemetry was enabled
while diagnosing gestures, so these samples are not a calibrated performance
benchmark. The clean fixture now hides telemetry unless `debug=1` is requested.

Standalone Web row coordination remains application-owned, unlike UITableView's
single-open-row behavior. No screen-reader session, exhaustive contrast audit,
full docs production build, native spring fit or universal native parity was
established. Existing value/callback APIs and native Web editing boundaries are
retained. The earlier broad DOM-suite text-press failure was not changed or
reclassified by this scoped physical-device pass.
