# SegmentedControl and Tabs presentation unification

Date: November 9, 2026.

## Shared presentation, separate behavior

SegmentedControl now uses the existing Tabs segmented StyleX rules and the same
track, highlight, label-refraction and fallback-lens markup. The extracted
`utils/segmented-presentation.tsx` owns that markup; the existing spring controller
in `utils/interaction/tabs.ts` decorates both kinds of control using their native
selection attributes. No spring constants or optical recipe were copied into a
second implementation. Retained adaptation copyright and MIT notices remain.

Both controls use the same capsule, fill, typography, sliding indicator, held
lift, deformation and reduced-motion policy. The presentation options match:
`size="sm"` (28px segments), `size="lg"` (46px), `glass=false`, `elastic=true` and
`lift=20`. Long SegmentedControl labels truncate within constrained segments.
Empty collections clear their decorative copies and retain the empty label.

The state and semantics remain distinct. SegmentedControl stays a Base UI
RadioGroup with native inputs, form association/submission, read-only and
disabled behavior, change cancellation, controlled rejection and reset handling.
Tabs stays Base UI Tabs with tab/panel associations, activation policy and
overflow-menu behavior. Press/drag activation calls the original native item;
presentation does not invent a separate selected value. Decorative copies remain
inert and hidden from assistive technology, with form names removed.

The original default SegmentedControl height changes from the first batch's
44px target to Tabs' compact geometry. Consumers needing larger targets can use
`size="lg"`. The API additions and layout note are in
[the migration guide](../migrations/segmented-control-section-index-migration.md).
The docs Story includes Standard, Large, Glass and Compare with Tabs examples.

## Validation

- Focused DOM regressions cover radio forms/reset/rejection/read-only and existing
  Tabs fractional geometry in LTR/RTL, including capture transfer and cancellation.
  All eight cases passed, with 81 assertions.
- The browser comparison measures matching item width/height, typography, radius
  and track fill for radio and tab semantics. It exercises actual held lift,
  drag release and settling under normal motion in Chromium/WebKit, light/dark.
- Both sizes and the shared glass material are compared. Keyboard selection,
  form submission, canceled reset, read-only/disabled states, controlled rejection,
  empty-to-populated options, RTL, 320px layout and reduced motion remain covered.
- Existing Tabs overflow-menu and first-paint suites pass in Chromium/WebKit,
  light/dark, including vertical, glass, constrained and initial selected cases.
- Source formatting/lint, affected types/builds and installed-consumer package
  delivery are checked alongside generated API/documentation contracts.
  The installed-consumer check and 16 docs producer/projection regressions passed.

Maintained browser checks are `apps/docs/test/segmented-section.mjs`,
`apps/docs/test/tabs-overflow.mjs` and `apps/docs/test/first-paint.mjs`.
Local fixture screenshots are retained under `output/playwright/segmented-section/`.
These are browser observations of a shared Web implementation, not a native
iPhone parity or performance benchmark. No real-device or screen-reader session,
exhaustive theme/contrast audit or full docs production export is claimed.

## Scoped design review

The purpose is state feedback and continuity within one familiar segmented
control language. ENERGY 1 / RHYTHM 1 / MOTION 2, using the existing Tabs motion
and materials. No new easing, timing scale, dependency or glass recipe is added.

- Hard gate PASS within the exercised controls: working native items, forms,
  disabled/empty states, keyboard feedback and narrow layouts in both themes.
- Purpose gate PASS: one selected surface and held lens communicate selection
  and direct manipulation, using the established material recipe.
- Liveliness PASS: shared slide/lift/deformation respond to the same input,
  with the existing reduced-motion path remaining available.
- Craftsmanship PASS within the recorded scope: one presentation implementation,
  separate semantic state owners, browser regressions and package checks.

Scope excludes native rendering equivalence and blanket visual approval of
unrelated documentation-shell UI. The changed React Doctor scan skipped the
untracked UI source; its workspace score is not evidence of this change's quality.
