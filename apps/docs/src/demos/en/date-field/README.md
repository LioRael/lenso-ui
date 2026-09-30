# DateField and TimeField live examples

Source authority: HeroUI v3.2.6,
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`. The corresponding
`apps/docs/content/examples/en/<family>/<basename>.json` archives were read
individually, including both existing basics, before reconstruction.
Derived source is Copyright NextUI Inc., Apache-2.0.

## Exact inventory

Each basename below is an independent runnable `.tsx` module with its genuine
source-named export, not a reexport of Basic.

| Basename                 | DateField           | TimeField           |
| ------------------------ | ------------------- | ------------------- |
| `basic`                  | Basic               | Basic               |
| `controlled`             | Controlled          | Controlled          |
| `custom-styles`          | CustomStyles        | CustomStyles        |
| `disabled`               | Disabled            | Disabled            |
| `form-example`           | FormExample         | FormExample         |
| `full-width`             | FullWidth           | FullWidth           |
| `granularity`            | Granularity         | —                   |
| `invalid`                | Invalid             | Invalid             |
| `on-surface`             | OnSurface           | OnSurface           |
| `render-function`        | RenderFunction      | RenderFunction      |
| `required`               | Required            | Required            |
| `variants`               | Variants            | —                   |
| `with-description`       | WithDescription     | WithDescription     |
| `with-prefix-and-suffix` | WithPrefixAndSuffix | WithPrefixAndSuffix |
| `with-prefix-icon`       | WithPrefixIcon      | WithPrefixIcon      |
| `with-suffix-icon`       | WithSuffixIcon      | WithSuffixIcon      |
| `with-validation`        | WithValidation      | WithValidation      |

Archive/local basename equality was checked: DateField **17/17**, TimeField
**15/15**, no missing or extra scenario modules.

## Adaptations and source behavior

- Basic retains the source's empty segmented field, name, local accessible label
  and 256px width. Shared declarations in `demo-styles.ts` translate the source
  utilities to StyleX; they do not supply alternate scenario implementations.
- All labels, descriptions and errors use each field's local RAC compound parts.
  RAC Form is imported through its individual subpath for native validation
  context. Ordinary global Field labels are not used.
- Date controlled/validation/form values remain `DateValue | null`; time
  controlled remains `TimeValue | null`, while validation/form remain
  `Time | null`. Source `today(getLocalTimeZone())`, `now(...)`, `Time`
  construction, comparisons, limits, setters, clearing, submission delay and
  pending/reset behavior are preserved.
- Date granularity retains all four source options and source defaults:
  `parseDate("2025-02-03")` for day, and
  `parseZonedDateTime("2025-02-03T08:45:00[America/Los_Angeles]")` for the
  other units. Changing the option remounts the uncontrolled field so the
  appropriate source default value type actually takes effect. Without this,
  the initial date-only value survives later `defaultValue` changes.
- Ordinary Select uses native Base UI `onValueChange`, `Item.value`, List and
  portal composition. Tooltip uses Trigger delay and Popup/Positioner.
  Button uses native `onClick`/`disabled` and Lenso `isLoading` instead of the
  upstream RAC-style ordinary-control props.
- Source primary/secondary groups, Surface, prefix/suffix Gravity icons,
  custom border/background/shadow/ring/focus styling, description order and
  render-function composition are retained. Decorative icons are hidden from
  accessibility APIs. Width declarations include a containing-width cap to
  prevent the source fixed widths from overflowing mobile docs.
- The 32 archives do not contain readonly, unavailable-date, era/calendar
  selection, explicit placeholder values or locale-selector scenarios. These
  were not fabricated as extra docs scenarios. Empty source fields retain RAC
  placeholders. Readonly and internationalization are exercised separately by
  the proof harness.

## Verification

`browser-proof.mjs` exists because package-level RAC keyboard coverage does not
prove that all archived demos mount, their controls update the source state,
or their source-specific render composition and form submission are live.
It uses a built UI consumer with automatic JSX, StyleX `dev: false`, no CSS
layers and LightningCSS `exclude: 4`. It writes only to scratch; the dependency
checkout passed on the command line is read-only.

```sh
node apps/docs/src/demos/en/date-field/browser-proof.mjs <built-checkout-root>
```

Completed against the parent's built packages and dependencies:

- Strict TypeScript: all 32 scenario modules and the StyleX declarations, using
  parent's built public UI declarations. No errors.
- Shared standard oxlint: zero warnings/errors. Shared oxfmt check passed.
- Chromium: all 32 scenarios mounted in each of desktop/light/LTR at 1440px
  and mobile/dark/RTL/reduced-motion at 390px: **64 measured mounts**, no client
  errors or document overflow.
- Real keyboard controlled date/day and time/minute increments, Set today /
  Set now and Clear; disabled fields excluded from tab stops.
- Invalid fields and typed dates before today / times outside 09:00–17:00
  display source errors.
- Both forms begin disabled, accept valid typed values, enter pending state,
  submit and reset to empty/disabled after the source 1500ms delay.
- Granularity changes show day / hour / minute / second segments, with the
  source LA timezone displayed as PST. Observed source value displays:
  `2/3/2025`, `2/3/2025, 8 AM PST`, `2/3/2025, 8:45 AM PST`,
  `2/3/2025, 8:45:00 AM PST`.
- Date render-function root/label/group/input and time render-function root
  produce their specified custom elements.
- Additional isolated fixtures prove en-GB day-first segment order, 24-hour
  `13:30` without AM/PM, and readonly date/time resistance to ArrowUp editing.
- React Doctor scanned the 32 selected files. One maintainability warning:
  intentionally repeated full-width source JSX. No implementation was replaced
  with a generic alias to silence it. Score was unavailable because remote
  scoring/telemetry was disabled.

## Coverage limits and integration ownership

No local scenario/API blockers remained in the built-consumer proof. Parent
owns docs dependencies and source-path registry integration; the complete
Next.js docs route was not executed in this isolated checkout.

This proves source behavior and live mounts, not pixel-identical upstream
screenshots, every calendar/era, unavailable dates, every locale, DST transitions,
or every theme/responsive combination. Those are not claimed as completed.
Primitives and React/style implementations were not modified by this worker.
