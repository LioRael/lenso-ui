# Date/time Storybook evidence

## Result and boundary

The bounded batch has **40 distinct pinned source exports**: date-field 15,
time-field 13, date-picker 6 and date-range-picker 6. A fresh scratch build passed
tokens/UI compilation, strict Storybook TypeScript and the production Storybook
build under Node **24.18.0** and pnpm **11.5.0**.

Chromium **151.0.7922.34** mounted all 40 production iframe stories in light and
dark, **80 mounts total**, with no uncaught browser errors. All **20 enabled
picker mounts actually opened their calendar dialogs**. Disabled picker triggers
remained disabled. The workflow proof passed the interactions listed below.

This is not a claim of complete visual parity. The measured pre-fix contextual
label gap is recorded below and requires a core-owned correction. No component,
token, primitive, dependency, shared configuration, inventory or coverage file was
patched by this batch. Standalone calendar/range-calendar stories belong to
another batch; these picker stories keep their own local calendar-content
functions and use no shared calendar fixture names.

Delivered files:

- `stories/date-field.stories.tsx`
- `stories/time-field.stories.tsx`
- `stories/date-picker.stories.tsx`
- `stories/date-range-picker.stories.tsx`
- `stories/date-time-story.fixtures.tsx`
- `stories/date-time-story.stylex.ts`
- `stories/date-time-story-build.fixtures.mjs`
- `stories/date-time-story-proof.mjs`
- This evidence file.

## Immutable source and licenses

Authority: HeroUI **3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.

Each complete immutable raw file was fetched and read, not just its exports:

| Family            | Full raw source                                                                                                                                                                                             | SHA-256                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Date field        | [date-field.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/date-field/date-field.stories.tsx)                      | `82fee4db20182ee67ca510218cfdbdcbef14b619eaa7cf54220e02cd5ad27d5a` |
| Time field        | [time-field.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/time-field/time-field.stories.tsx)                      | `21da2f7c38edb6d895e4773bb51727e39e80159836322372f52fd46c47ec7d45` |
| Date picker       | [date-picker.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/date-picker/date-picker.stories.tsx)                   | `2c3760568f8fe63e1437ce3e1ced64d0ec7150dc8a6039f67630eb943b82a6e6` |
| Date range picker | [date-range-picker.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/date-range-picker/date-range-picker.stories.tsx) | `9558f14b291766ca8d937452cff57647cf8fbd40e2f926d76758a829fdd2a81c` |

The adaptation retains Apache-2.0 notices in each derived source file.
`third-party/heroui/LICENSE.txt` and `third-party/heroui/NOTICE.md` retain the
upstream terms and attribution. The four decorative SVG paths are genuine
Gravity UI `calendar`, `clock`, `chevron-down` and `circle-question` paths,
retrieved from Iconify, with the existing
`packages/storybook/GRAVITY-ICONS-LICENSE.txt` retaining YANDEX LLC's MIT notice.
`DATE_TIME_VERIFY_PIN=1` refetches all four raw files, verifies their full byte
hashes and exact export order, and verifies the original Gravity paths.

Exact export order:

- **Date field, 15:** `Default`, `Variants`, `FullWidth`, `WithDescription`,
  `Required`, `Invalid`, `Disabled`, `Controlled`, `WithValidation`,
  `WithPrefixIcon`, `WithSuffixIcon`, `WithPrefixAndSuffix`, `FormExample`,
  `Granularity`, `AllVariations`.
- **Time field, 13:** `Default`, `FullWidth`, `WithDescription`, `Required`,
  `Invalid`, `Disabled`, `Controlled`, `WithValidation`, `WithPrefixIcon`,
  `WithSuffixIcon`, `WithPrefixAndSuffix`, `FormExample`, `AllVariations`.
- **Date picker, 6:** `Default`, `Controlled`, `Disabled`, `WithValidation`,
  `WithCustomIndicator`, `FormExample`.
- **Date range picker, 6:** `Default`, `Controlled`, `Disabled`,
  `WithValidation`, `WithCustomIndicator`, `FormExample`.

## Native composition and source adaptations

- Public Lenso roots retain native RAC models, constraints, names, segment
  render functions, picker triggers, calendars and year-selector parts.
  Supporting labels, descriptions and errors use the relevant contextual
  `DateField`, `TimeField`, `DatePicker` or `DateRangePicker` parts, not Base UI
  field parts in an unrelated context.
- Ordinary actions use the native Base UI-backed `Button`: `onClick`,
  `disabled` and `isLoading`. Granularity uses the native Base UI-backed
  `Select` collection, `onValueChange`, portal and positioner; its information
  tooltip uses the native tooltip contract.
- Source text, names, constraints, initial values, controlled outputs,
  granularity choices, Los Angeles zoned value, form waits, icon placement and
  distinct workflows remain present. No story export aliases the default.
- Source utility geometry becomes compiled StyleX: 256/280/320/400px widths,
  4/8/12/16/24px gaps and 16px icons. There are no utility `className` props,
  Tailwind tooling or fabricated component styles in this batch.
- Native forms serialize real named inputs through `FormData`. The isolated
  submission helper records the serialization and submission count as invisible
  form data attributes before the simulated request clears controlled values.
  Console-only upstream logging is replaced by this testable browser evidence.
  Submit buttons remain keyboard-focusable while pending and block repeat
  activation. Source waits remain 1500ms for field forms and 1200ms for pickers.
- Picker popovers contain the public contextual `Dialog` part, needed by
  Lenso's native public anatomy. Controlled output outside a picker uses a
  styled native paragraph rather than pretending to have a field context.
- Granularity keys the uncontrolled field by granularity. Switching from a
  date-only default to an hour/minute/second zoned default therefore remounts
  with the appropriate model, rather than asking RAC to retain an unsupported
  date-only model at time granularity. This intentionally resets the default
  when changing granularity; it does not claim to preserve user edits across
  format changes.
- Optional `dateTimeLocale` iframe query values wrap only these four families
  in public `react-aria-components/I18nProvider` with native DOM direction.
  No query override changes the normal source story locale.

Bare date-boundary dependencies used by the delivered stories are
`@internationalized/date` **3.12.4** and `react-aria-components` **1.21.1**.
`DateValue` is imported from the public `Calendar` subpath and `TimeValue` from
the public `TimeField` subpath. Existing `@storybook/react-vite` supplies
Storybook types. This worker did not change dependency manifests or pins.

## Live production proof

The proof loads built `iframe.html` stories from the production index. It does
not import the source stories into a separate test application or treat snippets
as working demos.

| Evidence                | Actual action and result                                                                                                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exact exports           | Four local export lists and all 40 production index entries match the immutable upstream names and order.                                                                                                                                                |
| Both themes             | All 40 stories mount once in light and once in dark. Roots and groups have nonzero geometry. Screenshots record 80 mounted states.                                                                                                                       |
| Interactive segments    | Every enabled mount receives real pointer focus and `ArrowUp`; native `aria-valuenow` changes from placeholders to editable values.                                                                                                                      |
| Required/invalid        | Required root `data-required` and segment `aria-required` are present. Invalid root `data-invalid` and segment `aria-invalid` are present.                                                                                                               |
| Disabled                | All disabled spinbuttons expose `aria-disabled`; both picker families' native triggers are disabled.                                                                                                                                                     |
| Actual picker opening   | All five enabled exports per picker family open by pointer in both themes, 20 actual dialogs. Calendar grids/buttons have visible geometry. `Escape` closes and restores native trigger focus.                                                           |
| Controlled fields       | `Set today`/`Set now` populate the models; arrow editing changes the date; `Clear` restores the empty controlled output, in both themes.                                                                                                                 |
| Format/timezone         | Native Select switches Day/Hour/Minute/Second. Expected segments appear/disappear; the serialized zoned model retains `[America/Los_Angeles]`. The information tooltip actually opens on hover.                                                          |
| Date validation         | Keyboard input of `2000-01-03` shows the source error and invalid ARIA state; `2090-07-12` restores the valid description and state, in both themes.                                                                                                     |
| Time validation         | 08:30 is rejected and 10:30 accepted under the source 09:00–17:00 constraints, in both themes.                                                                                                                                                           |
| Field forms             | Empty/invalid submits are disabled. Actual native FormData is `{date:"2090-07-12"}` or `{time:"10:30:00"}`. Submitting shows the pending state, remains focusable, blocks repeat Enter/Space and then clears named values after the source delay.        |
| Controlled pickers      | Calendar selection changes the displayed controlled date/range. Range endpoints are committed with keyboard navigation and Enter, in both themes.                                                                                                        |
| Picker validation       | Past date/range keyboard entry shows contextual errors and invalid controls.                                                                                                                                                                             |
| Picker forms            | Clicking today's calendar cell, plus ArrowRight/Enter for a range end, commits named FormData: `appointmentDate` or `tripStartDate`/`tripEndDate`. Range end is later than start. Pending activation guard and controlled reset complete in both themes. |
| Calendar/year selection | Both picker families open their contextual year selector, focus the selected year, navigate by ArrowRight, commit with Enter and change the heading, in both themes.                                                                                     |
| British locale          | `en-GB` changes date order to day before month; ArrowUp edits day and ArrowRight focuses month. Time uses 24-hour segments with no AM/PM segment.                                                                                                        |
| Scoped mobile/motion    | At 390×844, dark default pickers open by pointer with calendars inside viewport bounds. Reduced-motion keyframe duration is `0s`.                                                                                                                        |
| Scoped RTL              | Dark default range picker under `ar-EG` has RTL root direction, opens by pointer and retains RTL direction in the portalled calendar.                                                                                                                    |

The proof captures settled screenshots after active animations finish and
records the source/local hashes, production index hash, emitted JS/CSS hashes,
browser version, geometry, supporting-label computed styles, opening results
and coverage limits. Artifacts stay in scratch; no generated browser report or
screenshots are committed.

## Measured core gap, pre-fix baseline

The successful build/proof measured the public contextual labels before the
separate core-owned correction:

- Required date/time labels have computed `::after` content `none`.
- Date/time labels use font weight `400`, including the variants that should
  inherit the upstream `.label` medium weight.
- Invalid labels retain foreground color instead of danger.
- Disabled labels retain opacity `1`.
- Picker supporting-label aliases inherit the same implementation.

The full immutable
[upstream label stylesheet](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/styles/components/label.css)
uses medium weight, required asterisks under `data-required="true"`, danger under
`data-invalid="true"` and disabled status feedback. The local contextual label
style maps do not compose that feedback. Native required/invalid semantics and
form behavior passed despite this visual gap.

This batch deliberately does not compensate with story-only label styles or
patch any package. The parent owns the separate fix and should rerun this proof
after it lands in the workspace. The `supportingVisual` observations in the
report permit a direct before/after comparison. The pointer-events trigger fix
and default range-separator fix were already available from the parent and were
exercised through public parts.

The parent subsequently repaired the contextual labels using the shared label
map and the roots' required markers, without reading nonexistent required
properties from picker/color state objects. A controlled old-composition run
failed with weight `400` instead of `500`; the corrected date/time boundary
and concrete-contract suites passed 15 tests, including both-theme picker-alias
and color-label required/invalid/disabled transitions. The parent then rebuilt
Storybook and reran this 40-story production proof successfully. The pre-fix
measurements above remain historical evidence, not current unresolved behavior.

The initial locale-order failure was a **harness failure**, not a component
gap: pnpm 11 auto-installed a scratch workspace without a lock while manually
linked Storybook models still used the parent's dependency tree. This created
two physical React Aria contexts. The final build fixture invokes existing
package build binaries directly, asserts that no scratch `.pnpm` tree appeared
and checks that date model/provider links share one physical root.

## Reproduction

Run from the attached worktree with Node 24.18.0 and pnpm 11.5.0 on `PATH`.
`SCRATCH` must name an empty scratch directory, not a checkout. `DEPS` is the
read-only checkout containing already-installed dependencies:

```sh
export PATH="/Users/leosouthey/.local/share/mise/installs/pnpm/11.5.0:/Users/leosouthey/.local/share/mise/installs/node/24.18.0/bin:$PATH"
export DEPS="/Users/leosouthey/Projects/framework/lenso-ui/.delta/worktrees/gh6m3ndgjcxx/lenso-ui"
export SCRATCH="$DELTA_SCRATCH_DIR/date-time-validation"

node packages/storybook/stories/date-time-story-build.fixtures.mjs "$SCRATCH" "$DEPS"
DATE_TIME_VERIFY_PIN=1 node packages/storybook/stories/date-time-story-proof.mjs \
  "$SCRATCH/date-time-storybook-static" \
  "$DEPS/packages/react/node_modules/playwright/index.mjs" \
  "$SCRATCH/date-time-artifacts"
```

The build copies current source into scratch, excludes existing build outputs,
links installed dependencies read-only, freshly builds tokens/UI, runs strict
Storybook TypeScript and builds production Storybook. It never installs into or
writes to the dependency checkout. Existing unrelated stories participate in
the strict check and production build; the browser proof is scoped to these
four families.

Also run the repository's existing oxlint and oxfmt binaries on the four story
files and the `date-time-story*` fixtures/proofs. The scoped result was **zero
oxlint warnings/errors** and a passing **oxfmt check**. A transient
`react-doctor@latest --verbose --scope changed` attempt with scratch-only caches
timed out before producing a scan or score; no health-score claim is made.

Last complete acceptance run: scratch `date-time-build7` and
`date-time-artifacts7`, Node `v24.18.0`, Chromium `151.0.7922.34`, browser
timezone `America/Los_Angeles`.

| Artifact/input                | SHA-256 at that run                                                |
| ----------------------------- | ------------------------------------------------------------------ |
| Production `index.json`       | `8681b12c3ceb2fa7322b5339f23e51c151ab2d091c40e477248a2277ba7f8cdd` |
| Scratch proof JSON            | `997b4192902e951f0d9a703d50efa59bdc327c4630c1a2a02468b481a2b6afa6` |
| Local date-field story        | `f34f7cf0613ec7271ddc15a7621bc7894ffb082bc56ae724114c50e29468bb4c` |
| Local time-field story        | `da4dd9ac5b18e9a5219337b7b28f3c6842da9727f7ce6dbb6d40c2ca7b78011b` |
| Local date-picker story       | `d171ba7f04fee2fac868e429e2cde56ad309a6460976c271fe735f49bcf0dfc4` |
| Local date-range-picker story | `25836ecb58ecb09e811ecf2e80fb111f165bbbd23f6d64b19298606e3b13f4ba` |
| Local supporting fixture      | `5d7d65b8ece9a93d4185529b1fd0164e197a9f3a128001772ea4b3bed9126baf` |
| Local story StyleX            | `77da06c94b3462149c2723bf0f6a3fe2744a5a5c43358053fa96d955cfcdcaa9` |
| Local build proof             | `91fc8c20980a33e345612e00cfe372ddc7d797d50af9c3a64a52eb0ffb3143ff` |

The successful report includes hashes for all **191** emitted JS/CSS files.
After that run, the proof's comma-expression lint warning was corrected without
changing the keyboard actions; proof/license self-hash metadata was added.
Rerunning emits fresh hashes, rather than treating the above scratch build as
proof of future package changes.

## Scope limits and antislop delivery gate

Antislop was applied **during** implementation. Design read: component examples
for library users in the explicitly requested HeroUI 3.2.6 source language,
**ENERGY 1 / RHYTHM 1 / MOTION 2**. Uniform layouts isolate component behavior;
the source accent communicates focus/selection; source motion explains picker
appearance. No branding, assets, marketing sections or decorative redesign
were invented.

- **PASS, source authority/purpose:** theme, radii and spacing retain the
  requested source. Stories use native package typography, with its measured
  label gap recorded above; StyleX replaces utility geometry without adding
  another visual system.
- **PASS, functional controls/states:** recorded pointer/keyboard workflows
  cover empty, controlled, invalid, disabled and pending states in both themes.
- **PASS, evidence/honesty:** exact source hashes, export lists and live iframe
  actions are distinguished from visual fidelity. No fabricated statistics,
  customers or compliance claims appear.
- **PASS, source/content restraint:** source-specific labels/actions remain;
  calendar, clock, chevron and question icons retain their intended meanings.
- **LIMIT, full visual gate:** the pre-fix contextual-label gap prevents a
  complete source-parity claim. No upstream browser side-by-side pixel
  comparison was performed.
- **LIMIT, mobile:** only dark default picker opening/bounds at 390px are
  covered. Source FullWidth stories intentionally retain their 400px container;
  this is not a claim that every source story is mobile-safe or has 44px targets.
- **LIMIT, RTL:** only the dark Arabic default range-picker root and opening
  are covered, not all 40 stories or RTL keyboard traversal.
- **LIMIT, motion:** only the dark default picker reduced-motion keyframe
  duration/opening is covered, not a complete motion audit.
- **LIMIT, accessibility:** native semantics/keyboard proof does not certify
  screen-reader behavior or WCAG AA. Exact upstream colors have known
  normal-text contrast failures, as stated by `DESIGN.md`; this bounded source
  reconstruction does not alter those colors.
- **LIMIT, platform/locale:** Chromium desktop keyboard/pointer, en-US/en-GB
  plus the scoped Arabic case and one browser timezone are tested. Native
  mobile browsers, other engines and a locale/timezone matrix are unverified.

The bounded functional proof passes. A universal antislop, accessibility,
responsive or visual-parity pass is not claimed.
