# Calendar Storybook evidence

## Result and boundary

The pinned story inventory is implemented as **46 independently exported live
stories**: Calendar 26 and RangeCalendar 20. The stories render the local exported
`Calendar` and `RangeCalendar` compounds, their contextual year/date parts, native
Base UI-backed Lenso buttons and selects, and compiled StyleX layouts.

Verification on 2026-10-01 used **Node 24.18.0 / pnpm 11.5.0**:

- Fresh tokens build and fresh UI build from copied current source.
- Strict Storybook TypeScript check, including the complete existing story surface.
- Production Storybook build with the unchanged production configuration.
- **92 actual production iframe mounts**: every pinned export in light and dark.
- **17 browser assertion groups**, including native keyboard date/range selection,
  controlled actions, focus/navigation, min/max and unavailable dates, year picking,
  Indian-calendar locale/era, native day/week selects, custom cell content, booking
  state, multi-month geometry, mobile scrolling and document RTL smoke.
- Zero uncaught browser errors; oxlint reports zero errors/warnings on the owned
  calendar source/proof files. oxfmt applied only to these owned files.

The final recorded browser run began at `2026-10-01T21:38:29.374Z` (UTC).
Its JSON SHA-256 is
`e1ecd92793021037262c53cac41c738f2e51e4715ca06db3f21b1deef3159589`,
with 92 mount records, 17 assertion groups and 187 production JS/CSS asset
fingerprints. Observed root widths were 252/544/824px; Calendar heights were
120–282px and RangeCalendar heights 124–306px across the source view compositions.
Artifacts are scratch-only; the durable scripts regenerate them.

These checks establish the recorded native workflows and local geometry, **not
full upstream visual parity**. No upstream browser screenshot comparison was
performed. The output is not a claim of WCAG AA compliance.

## Immutable source and licenses

Complete immutable raw files were fetched and read, including all helpers and
story bodies, from HeroUI **3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.

| Family        | Immutable raw source                                                                                                                                                                               | SHA-256                                                            |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Calendar      | [calendar.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/calendar/calendar.stories.tsx)                   | `7a051680459e56b82842583c5f7582f3a0a679770bab0cb32c26588fbb1d88c8` |
| RangeCalendar | [range-calendar.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/range-calendar/range-calendar.stories.tsx) | `d0b4ab899f1b37341c0eeab8174ac8f3ae0803e05116c9b5ca98ae951fb02dce` |

HeroUI-derived stories and layout fixtures retain Apache-2.0 adaptation notices:
Copyright NextUI Inc. The existing full license and attribution are
[LICENSE.txt](../../third-party/heroui/LICENSE.txt) and
[NOTICE.md](../../third-party/heroui/NOTICE.md). The two custom navigation SVG paths
are copied from the pinned Calendar story, not generated assets.

The raw source is reference material, not imported as a working demo. The proof
can fetch it again, verify exact hashes/export order, and save the raw bytes beside
the browser artifacts. Existing docs examples are not substituted for this inventory.

## Exact exports

Calendar:

`Default`, `WithYearPicker`, `DefaultValue`, `Controlled`, `MinMaxDates`,
`UnavailableDates`, `WeeksInMonth`, `MultipleSelection`, `CustomUnavailableDates`,
`Disabled`, `ReadOnly`, `Invalid`, `FocusedValue`, `WithIndicators`,
`TodayIndicator`, `MultipleMonths`, `DayView`, `WeekView`, `InternationalCalendar`,
`ThreeMonths`, `BookingCalendar`, `YearPicker`, `YearPickerStyledCells`,
`YearPickerCustomCells`, `CustomNavIcons`, `EventCalendar`.

RangeCalendar:

`Default`, `WithYearPicker`, `DefaultValue`, `Controlled`, `MinMaxDates`,
`UnavailableDates`, `WeeksInMonth`, `AnchorUnavailableDates`,
`AllowsNonContiguousRanges`, `Disabled`, `ReadOnly`, `Invalid`, `FocusedValue`,
`WithIndicators`, `MultipleMonths`, `ThreeMonths`, `DayView`, `WeekView`,
`InternationalCalendar`, `BookingCalendar`.

There are no `Default` aliases or synthetic extra exports. The actual pin does
not contain additional named era/weekday stories. Its `hi-IN-u-ca-indian`
composition exercises the Indian calendar and its era/year; its grids retain
native weekday headings.

## Native adaptations and source fidelity

- Source titles, layout, tags and documented controls are retained. Every
  source story has its own exported render object.
- Shared fixture helpers remove repeated native compound scaffolding; they
  do not flatten controlled, range, unavailable, indicator or year-cell behavior.
- Ordinary upstream `onPress` becomes native Base UI-backed `Button.onClick`.
  Calendar navigation and year picker buttons remain contextual date-family parts.
- Ordinary select composition uses native `onValueChange`, items, Trigger,
  Portal, Positioner, Popover, List and Item contracts rather than RAC ListBox
  pretending to share a Base UI select context.
- Upstream utility layout/style strings become StyleX. Month columns remain
  256px, with source 32px two-month and 28px three-month gaps. The scroller
  overrides the local root's 252px constraint to 544px/824px desktop width,
  bounded by `100vw - 32px` on mobile. This exposes the intended entire desktop
  composition while containing horizontal scrolling on a phone.
- The selected-visible-day/week labels retain the pinned option text, rather
  than displaying only their primitive numeric values.
- Fixed source dates stay fixed: February 14; February 3–12 range; January 15
  invalid date; June 15 focus; Christmas and December 20–31 holiday presets;
  fixed February 14/17 and March 17 unavailable dates.
- `today(getLocalTimeZone())` is preserved wherever the source uses it. The
  browser proof uses UTC but does **not** fake the system date. Its JSON records
  the run timestamp/timezone separately. Ambient month alignment may place the
  current date in the second grid of a multi-month view, as the native model
  determines.
- Source weekend rules, booked-day arrays, blocked date intervals, anchor-relative
  seven-day limits, non-contiguous ranges and invalid-state predicates are retained.
- Source event titles and color metadata are retained. The source never renders
  its `bg-*` color metadata; those strings remain inert event data, not Tailwind
  classes or a Tailwind styling implementation.
- The source booking indicator condition is unreachable: every listed booked
  day is unavailable, while the indicator requires `!isUnavailable`. It is
  preserved and the proof confirms no booking dots. The selected `Book …` button
  has no booking handler in the pin; no invented booking backend or behavior is added.

No native API blocker was found for the exact pinned 46-story set.

## Why new browser proof was needed

Existing component tests and general iframe smoke do not establish that all 46
source-specific compositions are exported, active in both themes, use their native
contexts, or preserve controlled and unavailable-date behavior. The new bounded
proof addresses those concrete gaps:

| Behavior                | Recorded operation                                                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Date and range keyboard | Fixed February 2025 focus, ArrowRight and Enter; asserts selection actually changes to day 15 and range ends at 18           |
| Navigation              | Native previous/next buttons change February/March; ambient min/max blocks navigation beyond both endpoints                  |
| Controlled state        | Christmas/holiday presets, Clear, next-month source action and selected-date/range text                                      |
| Focus                   | Source Go to Jan control updates the controlled focused date                                                                 |
| Unavailable dates       | Weekend and blocked interval state; fixed February 14 cannot be selected; range anchor activates the seven-day restriction   |
| Non-contiguous range    | Initial range remains selected across unavailable days                                                                       |
| Read-only/disabled      | Forced pointer activation does not change selected-cell count                                                                |
| Validation              | Both source-invalid compositions expose native invalid state and become valid after native date/range selection              |
| Year picking            | Contextual trigger selects 2025; custom year content includes Now; unselected current year has the source styled inset ring  |
| Locale and era          | Native grid label contains Hindi text and the current Indian-calendar year, and that year exists in the contextual year grid |
| Day/week controls       | Real Base UI popup selects 10 days/2 weeks; native visible-cell duration changes                                             |
| Cell composition        | Source event/today indicators and both original custom navigation path bytes                                                 |
| Booking                 | Availability filter, selected native date/range, conditional Book text                                                       |
| Geometry                | 92 measured mounts; two/three native grids and 544px/824px desktop compositions                                              |
| Mobile and RTL          | 390px dark calendar bounds, contained multi-month scrolling; document-dir RTL navigation smoke                               |

Document RTL smoke is **not** an Arabic/Hebrew locale or full bidi-context parity
claim. The pinned international story is Hindi/Indian, not RTL. Exhaustive keyboard
matrices, every timezone, all calendar systems, upstream visual comparison and
automated color-contrast auditing are outside this proof.

## Locale harness defect: diagnosed and corrected

An early scratch recipe invoked `pnpm run build` without a copied lockfile.
pnpm 11 automatically installed packages into that scratch workspace. UI/native
date parts then used fresh scratch model copies, while extra Storybook model
links still pointed at the read-only dependency checkout. This produced two
physical locale contexts and made `InternationalCalendar` render English/Gregorian.
The initial broad mount checks were insufficient; a stronger locale assertion
caught it. That failed build is not counted as locale evidence.

The exact import graph observed in a scratch-only Vite resolver trace was:

```text
story: react-aria-components/I18nProvider
  <deps>/node_modules/.pnpm/react-aria-components@1.21.1_react-dom@19.2.8_react@19.2.8__react@19.2.8/node_modules/react-aria-components/dist/exports/I18nProvider.mjs
  -> react-aria/I18nProvider
  <deps>/node_modules/.pnpm/react-aria@3.52.1_react-dom@19.2.8_react@19.2.8__react@19.2.8/node_modules/react-aria/dist/private/i18n/I18nProvider.mjs

native Calendar and useLocale: react-aria-components/Calendar and react-aria-components/I18nProvider
  <scratch>/calendar-validation/node_modules/.pnpm/react-aria-components@1.21.1_react-dom@19.2.8_react@19.2.8__react@19.2.8/node_modules/react-aria-components/dist/exports/{Calendar,I18nProvider}.mjs
  -> react-aria/I18nProvider
  <scratch>/calendar-validation/node_modules/.pnpm/react-aria@3.52.1_react-dom@19.2.8_react@19.2.8__react@19.2.8/node_modules/react-aria/dist/private/i18n/I18nProvider.mjs
```

Both were ESM, with identical versions/peer suffixes, but different physical roots.
The failed production fixture bundle contained two `createContext(null)` locale
instances: native `Qr`/`ei` and story `By`/`Hy` in
`calendar.fixtures-BxAVXN5Q.js`. Moving the story provider into a non-StyleX
re-export fixture did not fix the root split; that experiment was removed.
The local public UI projection does not export `I18nProvider`.

The final recipe executes the **unchanged package build script strings directly**
using the supplied dependency bins, avoiding auto-install. It asserts provider
and consumer resolve to the same physical date/RAC roots and records those roots
in `calendar-build-proof.json`. The final unchanged production Storybook build
passes the actual Hindi text/Indian year assertions for both stories.
This was a harness defect, **not** a native API blocker. No root aliases, dedupe
configuration, dependency versions or public APIs were changed by this batch.

## Re-run

Only the six calendar-specific story/fixture/style/proof files and this evidence
document belong to this batch. Build output, generated raw source copies, JSON
measurements and screenshots remain in caller-supplied scratch directories.

The source's direct model imports require Storybook to declare
`@internationalized/date` **3.12.4** and `react-aria-components` **1.21.1**.
Manifest integration is owned by the parent, not this bounded story batch.
No direct `react-aria` or `react-stately` import is added. The recipe uses the UI's
existing read-only model roots when direct Storybook links are absent, and verifies
any existing direct links use those same physical roots.

```sh
export PATH="<Node-24.18.0-bin>:$PATH"
DEPS="/Users/leosouthey/Projects/framework/lenso-ui/.delta/worktrees/gh6m3ndgjcxx/lenso-ui"
OUT="$(mktemp -d)"

node packages/storybook/stories/calendar-build.fixtures.mjs "$OUT" "$DEPS"

CALENDAR_VERIFY_PIN=1 node packages/storybook/stories/calendar-proof.mjs \
  "$OUT/calendar-storybook-static" \
  "$DEPS/packages/react/node_modules/playwright/index.mjs" \
  "$OUT/calendar-artifacts"
```

The build copies current source, never reuses prebuilt UI/tokens, checks exact
Node/pnpm versions, and uses existing dependency packages read-only. Do not run
`pnpm install` or `pnpm run` inside the validation copy: auto-install can silently
replace that single-context setup.

`calendar-proof.json` records every family/export/theme mount and its geometry,
17 assertion groups, ambient run metadata, upstream hashes, production JS/CSS
asset hashes and uncaught errors. With `CALENDAR_VERIFY_PIN=1`, artifacts also
include both immutable raw files and 92 screenshots.

React Doctor's required changed-scope check was attempted from scratch with a
scratch npm cache. Package retrieval failed with `ECONNRESET`; no score is claimed.
This does not replace the successful strict TypeScript, oxlint and browser evidence.

## Antislop DURING delivery gate

Design authority was read before implementation: HeroUI 3.2.6 reconstruction,
not an invented redesign. The inherited direction is restrained component demos:
ENERGY 1 / RHYTHM 1 / MOTION 1. The selected date/range is the focal point; accent
communicates selection/today, whitespace separates controls from the calendar,
and month grids/year cells are the identity motif. No decorative assets, gradients,
generic marketing sections, fabricated claims or template animations were added.
Light/dark and keyboard workflows were verified during implementation.
The source-only inert booking button and unreachable booking-dot predicate are
explicitly documented rather than presented as completed product behavior.
