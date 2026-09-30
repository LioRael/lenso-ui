# Date picker example reconstruction

Authority: HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.
Every example was read from its corresponding
`apps/docs/content/examples/en/<family>/<basename>.json`; the archived
records were not changed.

## Source coverage

There are **23 source records: 21 named scenarios and two source-only
`format-options-no-ssr` helpers**.

| Basename                  | DatePicker              | DateRangePicker         |
| ------------------------- | ----------------------- | ----------------------- |
| `basic`                   | `Basic`                 | `Basic`                 |
| `controlled`              | `Controlled`            | `Controlled`            |
| `custom-styles`           | `CustomStyles`          | `CustomStyles`          |
| `disabled`                | `Disabled`              | `Disabled`              |
| `form-example`            | `FormExample`           | `FormExample`           |
| `format-options`          | `FormatOptions`         | `FormatOptions`         |
| `international-calendar`  | `InternationalCalendar` | `InternationalCalendar` |
| `render-function`         | `RenderFunction`        | `RenderFunction`        |
| `with-custom-indicator`   | `WithCustomIndicator`   | `WithCustomIndicator`   |
| `with-validation`         | `WithValidation`        | `WithValidation`        |
| `release-input-container` | —                       | `InputContainer`        |
| `format-options-no-ssr`   | source helper           | source helper           |

Named reexports retain the original scenario names and TSX paths. Shared
`parts` contain the repeated source calendar/input compositions; shared
`scenarios` contain the related, independently implemented scenarios. The
advanced format, render and input-container scenarios are not basic
fallbacks.

Adaptations:

- Context-dependent RAC labels, descriptions and errors use the picker
  compounds, not global ordinary-field support parts.
- RAC 1.21 native DOM `render` functions retain the source custom elements,
  semantic props and refs.
- Ordinary selects and switches use their local native Base UI contracts.
  Their option labels, values, controlled state and source geometry remain.
- Date/range values retain their original types and dates. In particular,
  the range format example intentionally uses **2025** for day granularity
  and **2026** for zoned date-time granularity, as its source does.
- Popup time editing uses native `state.setTime("start" | "end", value)` for
  range endpoints instead of casting incomplete values to a complete range.
  The single-date time state accepts complete time values.
- Source utility classes are expanded to StyleX. `shadow-sm` is the
  Tailwind 4 theme value, not an undefined runtime `--shadow-sm` variable:
  `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`.
- Custom indicators retain the source `gravity-ui:chevron-down` Iconify
  dependency. No replacement icon paths or data files were fabricated.
- Source default overlay placement is retained. These records contain no
  separate readonly, unavailable-date or custom-placement scenarios.

## Executed evidence

Proof used a temporary Vite/Chromium harness with copied local demo files
and readonly dependencies and compiled UI consumers from the parent graph.
Vite used automatic JSX, React deduplication and preoptimized RAC subpaths.
Demo StyleX compilation used `dev: false`, no CSS layers and LightningCSS
`exclude: 4`. No dependencies, package files, registration files or
components were modified by this worker.

- Strict TypeScript, including `noUnusedLocals` and `noUnusedParameters`,
  passed against the parent consumer declarations.
- Shared oxlint reported zero errors and zero warnings across all 28 TSX
  files. Shared oxfmt check passed.
- All **21 named scenarios mounted** without a page exception. All **19
  enabled popovers** opened using the keyboard and returned focus to their
  trigger after Escape. Both disabled triggers remained disabled.
- Both additional `next/dynamic` helpers mounted their actual asynchronously
  loaded format examples in Chromium, opened their calendars and handled
  Escape without a page exception. `next/dynamic` was explicitly
  preoptimized for this separate client-helper check.
- Controlled calendar selection used ArrowRight and Enter. Observed date
  changed `2026-09-30` to `2026-10-01`; observed range changed
  `2026-09-30 -> 2026-10-04` to `2026-10-01 -> 2026-10-06`, proving both
  endpoints changed. Clear, Set today and Set week updated the rendered
  controlled values.
- Both validation examples showed their actual errors after keyboard entry
  of January 2020. Both forms blocked empty submission, accepted calendar
  selection, entered their submitting state and reset after the source
  1200 ms delay.
- Both locale examples opened Indian calendars under `hi-IN-u-ca-indian`;
  the observed header was `शक 1948 अश्विन`, not a Gregorian header.
- Both format examples changed from minute to day and second granularity;
  the hour segment disappeared for day and the second segment appeared for
  second. Selecting 24-hour format removed the day-period segment. Hide
  timezone removed the zone segment. Force leading zeros produced padded
  segments.
- Popup time edits updated the associated root date input in all three
  time-capable scenarios. Single-date minutes changed to 30; range and
  input-container start/end minutes independently changed to 30 and 31.
- Measured custom input geometry: DatePicker 288 px, DateRangePicker 320 px,
  both with 12 px radius and 1 px border. Input-container root measured
  320 px despite its source 288 px max-width because the source 320 px
  min-width wins.
- Range format popup measured 252 px with a 228 px calendar content width.
  The source calendar `w-full` override is explicitly preserved, avoiding
  clipping at the popup's 12 px padding.
- Settled light/dark screenshots were inspected for custom and time-capable
  scenarios. Custom dark fields resolved the source default color to
  `oklch(0.274 0.006 286.033)` and the explicit source small shadow.

React Doctor's changed-scope docs scan reported 100/100 and no issues; its
post-scan interactive CI upsell was timed out without accepting any action.
This is advisory, not a replacement for the browser workflows.

## Boundaries and outstanding integration evidence

The two `next/dynamic` helpers were source-audited and client-executed in the
Vite harness; this does not prove their Next server/SSR behavior.
A Next docs build and registration proof belong to the parent.
An upstream rendered side-by-side visual comparison, all-scenario dark/RTL/
reduced-motion/mobile coverage, and Next SSR helper behavior are **not
claimed** by these checks.

The readonly parent consumer used for the checks above exposed two
component-level issues, reported to the date component owner:

1. Pointer clicking the calendar trigger is blocked because the source
   composition places it inside a suffix with inherited
   `pointer-events: none`. Keyboard activation works. No demo-level
   workaround was added.
2. The self-closing range separator currently renders an empty span rather
   than the upstream separator content.

The component owner subsequently reported both fixes GREEN in compiled
Chromium: the shared picker trigger now has `pointer-events: auto` and
opens its dialog with an unforced pointer click; the range separator
defaults to `" - "` with `aria-hidden` and nonzero glyph geometry.
Custom children and explicit null are preserved. No demo workaround is
needed.

That native proof is the component owner's evidence, not a rerun of this
worker's docs consumer. The parent must merge the native fixes, rebuild
the consumer and rerun the pointer/visual separator workflows before
declaring the integrated demos fully verified.
