# Calendar source-demo coverage

Authority: HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, Apache-2.0.
The snippets in `content/examples/en` remain reference material; these are
separate local React implementations.

## Registered records

The English calendar and range-calendar page references in
`content/source-index.json` register **39 records**. All 39 have a matching
`src/demos/en/<family>/<basename>.tsx` and the recorded named export.
The two `demo-parts.tsx` modules are supporting composition, not extra records.

| Family                | Registered and implemented basenames                                                                                                                                                                                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `calendar` — 19       | `basic`, `booking-calendar`, `controlled`, `custom-icons`, `custom-styles`, `day-view`, `default-value`, `disabled`, `focused-value`, `international-calendar`, `min-max-dates`, `multiple-months`, `multiple-selection`, `read-only`, `unavailable-dates`, `week-view`, `weeks-in-month`, `with-indicators`, `year-picker`                                  |
| `range-calendar` — 20 | `allows-non-contiguous-ranges`, `anchor-unavailable-dates`, `basic`, `booking-calendar`, `controlled`, `custom-styles`, `day-view`, `default-value`, `disabled`, `focused-value`, `international-calendar`, `invalid`, `min-max-dates`, `multiple-months`, `read-only`, `unavailable-dates`, `week-view`, `weeks-in-month`, `with-indicators`, `year-picker` |

Each record retains its own source model and workflow. Shared parts only compose
headers, grids, source spacing, notes and the native Base UI duration selector.
Buttons use native `onClick`; selectors use native `onValueChange` and collection
parts. Date values, selection arrays, anchored availability, range policies and
international calendar arithmetic remain RAC models.

## Observed Chromium evidence

An isolated scratch consumer used local React/style/demo source and read-only
parent dependencies: RAC 1.21.1, internationalized/date 3.12.4, React 19.2.8 and
Playwright 1.62.1. It compiled StyleX with `dev: false`, without CSS layers,
then processed CSS with Lightning CSS `exclude: 4`. Source constants from
`tokens.stylex.const` were folded before compilation; CSS variables and original
OKLCH values were retained. Theme/base CSS came from the read-only parent.
Nothing was installed or generated into the parent checkout.

- **39/39 records mounted in both light and dark themes**, with real compiled
  styles, nonzero calendar geometry and no page exceptions.
- **28 workflow/environment checks passed**:
  - Controlled multiple selection adds two dates and toggles one off by keyboard.
    Empty arrays initially focus the current month, not January 1900.
  - Both multiple-month records render distinct offset headings, two 256px
    grids and a 32px gap. At 360px, the 544px rail scrolls inside the component
    without horizontal page overflow.
  - Both fixed-six-week records keep 42 cells and stable grid height after
    navigation (239px single-calendar grid; 263px range grid in this consumer).
  - Both day selectors change 5 to 14 days; both week selectors change one to
    two weeks. Leading week-alignment dates remain disabled as in upstream.
    Arrow keys still navigate the resulting native date cells.
  - Both Indian-calendar records render the Hindi heading `शक 1948 अश्विन`,
    move year focus 1948 to 1951 with ArrowDown, and restore trigger focus on
    Escape.
  - Both min/max records disable earlier dates and stop forward navigation at
    the maximum month; read-only records reject keyboard selection changes.
  - Both calendar types reverse source chevrons under `ar-AE` with an explicit
    RTL scope and remove year-overlay transitions under reduced motion.
  - Anchor availability changes after choosing the first endpoint.
    Invalid ranges become valid after a shorter keyboard selection.
    Unavailable weekends cannot commit a single date.
    Non-contiguous ranges retain endpoints across blocked dates.
  - Custom range caps actually compute the source success color
    `oklch(0.7329 0.1935 150.81)` and 6px corners.
- Three additional persistent native regressions in
  `packages/react/src/components/calendar/advanced.test.tsx` passed in Chromium:
  empty controlled arrays, contextual inner-button styles with keyboard
  endpoints, and Indian year selection 1948 to 1949 with focus restoration.
- Shared-standard strict TypeScript, oxlint and oxfmt passed for this scope.

## Bounded implementation changes

RAC 1.21.1 treats an empty selection array as a date when computing initial
focus, causing it to clamp to the minimum bound. Local Calendar supplies today
only for an empty multiple selection without explicit default focus.

`RangeCalendar.Cell` accepts `buttonXstyle` for its contextual inner cap. This
translates the source custom-style descendant utilities without a global CSS
escape hatch. It does not replace RAC's date-cell interaction or selection state.

Calendar notes outside a field are native styled paragraphs, not global
`Description` components that require Base UI field context. No ordinary global
label is substituted inside a RAC date context.

## Limits

This proves executable record coverage and the listed behaviors, not complete
visual parity. Full side-by-side upstream screenshot comparison, every
calendar system and every combination of theme, locale and state remain
unproved. Booking demos retain the source's display-only booking button; they
do not invent a reservation service. Date-field, time-field and picker-family
records are covered by their separate owners, not this report.
