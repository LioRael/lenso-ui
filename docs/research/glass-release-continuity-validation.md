# Glass release continuity follow-up

## Corrected reference and behavior

The user confirms that the reference circle is enlarged by press. Both example
controls now rest at 50px high; the circle reaches approximately 70px when held.
The native reference crop has a narrow concave neck with a thin exterior rim,
rather than two complete borders through the contact.

The previous demo bound circle activation to spacing changes. Releasing a press
therefore changed layout. Glass activation now updates the example counter;
an independent control changes spacing. Button-family return springs are damped
to avoid undershooting their resting size and recrossing proximity thresholds.

The fusion surface uses fixed container coordinates, one current outline for
motion and settled rendering, and rejects stale asynchronous optical frames.
Backdrop copies replace temporary paint only after their first geometry/style
write. Press lighting is shared over the union; local lighting is hidden without
losing its opacity timing. A separate exterior rim remains above the lighting
and follows both neck shoulders. WebKit discarded the earlier fractional
morphology rim; a 1px contour with reduced opacity retains the dark edge.

Neck blending now limits swelling as the gap closes. The default example gap is
12px, with an 18px connection distance. Default pressed surfaces are bright in
both appearances, with dark labels; prominent controls retain their tinted fill.

## Recorded browser results

Default iOS 27 materials, marked backdrop, Chromium and WebKit automation:

| Check                                                            | Chromium       | WebKit         |
| ---------------------------------------------------------------- | -------------- | -------------- |
| Rest / held / returned circle diameter                           | 50 / 70 / 50px | 50 / 70 / 50px |
| Hidden connection frames during connected release                | 0              | 0              |
| Late outline changes after return                                | 0              | 0              |
| Disconnect transitions near threshold, mouse / synthesized touch | 1 / 1          | 1 / 1          |
| Separate exterior edge segments at neck                          | 2              | 2              |
| Edge alpha through neck interior                                 | 0              | 0              |
| Browser page/console errors                                      | 0              | 0              |

Release was sampled for 1.4 seconds, including the delayed full-optics stage.
The final outline exactly matched the pre-press outline. Edge pixels included
dark samples on both shoulders and no line through the neck interior.
Physical touch devices and native Safari were not tested.

The connected translation probe recorded frame P95 near 16.8ms in Chromium and
19ms in WebKit, with a 58ms WebKit maximum. A separate probe repeatedly crossing
the connection threshold reached a 112ms WebKit maximum; this is a remaining
performance limit, not evidence of native frame-time parity.

## Scoped delivery gate

- Hard Gate PASS: actual circle/add actions, independent spacing control, keyboard
  and stationary press, disabled/pending states, light/dark, reduced motion,
  forced colors and 390px overflow checks passed in both engines. Sampled pressed
  foreground/background contrast was 13.31:1 for default and 4.94:1 for prominent
  on the review backdrop. Arbitrary consumer backdrops/tints are not certified.
- Purpose Gate PASS: equal resting heights and stronger press growth follow the
  corrected reference; narrow shoulders and a continuous exterior rim express
  one connected material. Independent spacing controls isolate direct manipulation.
- Liveliness PASS: the existing documentation direction remains energy 1,
  rhythm 1, motion 2. The interacting pair remains the focus, with press feedback
  and proximity response as the deliberate interaction accents.
- Craftsmanship PASS for the changed scope: affected format/lint and glass,
  tokens and UI source-package type checks passed. Twelve glass tests, fourteen
  component/fusion DOM regressions and the installed-consumer production test
  passed. Package builds and documentation contract generation passed.

The complete testing-package typecheck remains blocked by the existing
`Tabs.Root variant` usage in `packages/ui/test/components.dom.test.tsx:199`.
No diagnostics were reported for the changed tests. That unrelated test/API
mismatch was not modified. A repository-wide candidate gate and a complete
production documentation-site build were not run.

Private reference images and rendered captures remain outside the repository.
