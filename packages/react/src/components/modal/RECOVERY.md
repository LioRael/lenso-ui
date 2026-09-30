# Overlay fidelity recovery

Recovered from failed worker `fb30a712353a429d`, persisted thread
`ksQQfBvqczO6S1itjS1r37sQtJLOAL4gZJIBxBCNPYY1SelDpa8d-o_uL8aK`.
The parent exported its full transcript because child-side Delta thread access
failed. Reconstruction used 61 recorded unified patches against the owned
baseline, not a redesign of the adapters.

The transcript contains a repeated AlertDialog edit; its duplicate was omitted.
Latest source changes include modal geometry/scroll/backdrops, alert icon tones,
drawer edge geometry and swipe variables, tooltip timing/geometry, toast stack
geometry/colors/dismissal, menu anatomy, and explicit-null portal semantics.
Vendor Root components are now wrapped before compound exports are attached.

## Evidence boundary

The old session proved four cases in Chrome: modal paint/geometry, alert
size/tone, right drawer edge, and collapsed toast heights. Those historical
results are not evidence that this recovered checkout passes.

The recovered test file adds reduced-motion/full sizing, logical RTL toast
placement, native drawer snap-point transforms, and inherited tooltip delays.
The prior session's separate scratch proofs exercised focus/Escape and menu
navigation; these do not prove source geometry or paint. This checkout also
adds focus trapping/return, Escape, real touch swipe/backdrop fade and toast
dismissal/promotion because the recovered geometry tests do not exercise them.

## Current verification

- Chrome: 53/53 owned browser proofs pass with Base UI 1.7, React 19.2.8,
  StyleX 0.19 and Vitest 4.1.10: 11 recovered overlay proofs, 18 native fidelity
  proofs, 13 live tooltip demo proofs and 11 source follow-up proofs. Including
  the parent's seven choice-control tests, the combined run passes 60/60.
- Browser harness built the complete styles package with recovered overlay maps,
  loaded its compiled `@lenso/tokens/styles.css`, and used the parent's current
  `styledPart` and `ThemeScope` helpers. No raw StyleX hashed-constant intermediate
  was treated as final CSS.
- Focused TypeScript checking uses the parent's current shared React standard
  (strict, unchecked-index and index-signature checks). It includes all ten
  owned families, the browser tests, six tooltip demos, current helpers and
  source style-map types.
- oxlint: zero warnings/errors across 50 owned React/style/demo files. oxfmt:
  all 29 files in the changed component/style/demo directories pass.
- React Doctor: six changed implementations and six tooltip demos checked
  locally; zero diagnostics. No score or supply-chain upload was requested
  for this focused scan; it is not a score regression comparison.
- Vitest reports a process-close timeout after successful tests (exit code 0).
  Package configuration and integration are parent-owned.

## Recovered native behavior

- Tooltip delay CSS is re-read when ancestors change attributes, stylesheet
  text changes or the viewport resizes. Explicit native provider timings take
  precedence over CSS; explicit trigger timings take precedence over both.
- Native toast promise success and rejection now replace the loading spinner
  with the pinned source default icon and set the source swap animation marker
  without remounting the toast. Native `error` type receives source danger paint.
  Default, accent, success, warning and danger icons reuse the preserved source
  glyphs; explicit indicator children remain supported.
- Interrupted drawer touch/pointer gestures cancel native close/snap proposals
  through public event details. Real touch cancellation restores the popup and
  backdrop in all four directions. Native vertical fractional snap offsets are
  painted in both directions; horizontal drawers intentionally ignore snap
  points, matching the native Base UI contract. Hardware-canceled proposals are
  not forwarded to controlled consumer setters: cancellation is not a request
  to close or change a snap point. Ordinary native change callbacks still fire.
  Both controlled regressions fail with the earlier forwarding rule and pass
  with this rule, using real CDP touch events.
- Tooltip and popover arrows now render the pinned source SVG. Native side
  attributes rotate and attach them to the correct edge. Popover overflow no
  longer clips its arrow. All four popover edges have actual hit-tested paint
  evidence.
- All six archived tooltip records have live same-basename implementations:
  basic, custom-styles, custom-trigger, placement, render-function and
  with-arrow. Browser proof covers explicit accessible descriptions, keyboard
  focus/Escape, custom triggers, render props, all four placements and the
  twelve-pixel custom offset. Source tooltip offsets are three pixels without
  an arrow and seven pixels with one.
- CDP touch coordinates account for Vitest's scaled iframe. The recovered
  dismissal test now targets the actual handle instead of relying on accidental
  unscaled contact with another part of the popup.
- Alert status icons now provide all five pinned source glyph variants at
  twenty pixels; omitted variant defaults to danger, matching the source.
  Bare modal/alert close parts provide the source CloseButton glyph, label and
  geometry while keeping native Base UI closing behavior. Custom children and
  render composition do not acquire absolute close-trigger positioning.
- Safe viewport alignment keeps oversized outside-scroll modal content reachable
  from its first paragraph through its last action. Four proofs use the source
  thirty-paragraph content at desktop/mobile widths, with both controlled and
  uncontrolled open state, and native Tab/ShiftTab scrolling.
- A forced native-fidelity → overlay → choice-control run passes all 34 original
  cases without mouse-reset calls. The reported integrated pointer failures were
  not reproduced in this diagnostic harness; no speculative mouse reset remains.
  An active contact is canceled during failure cleanup so a failed assertion
  cannot strand a CDP touch gesture.

## Remaining parity

These are not claimed complete:

- Full visual comparison across every placement, breakpoint, light/dark theme,
  nested overlay combination and submenu geometry.
- Full package integration/build and docs coverage; this proof used an isolated
  harness with the current parent dependencies and shared helper contracts.
  Non-tooltip overlay demo families are delegated separately; this recovery
  does not certify their coverage.
