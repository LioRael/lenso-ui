> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# TimeField for Exact Web

TimeField composes the same primitive-derived native segment inputs, keyed
DateInputGroup structure and Web controller as DateField. There is one draft,
request/rejection, focus, validation and cleanup owner. TimeField uses its shared
TimeField root recipe; other field parts retain the shared ordinary date-input
presentation. No React hook, primitive package or SDK change is introduced.

TimeFieldState declares id, label, description, error, value, placeholder, locale,
hourCycle, granularity, min/max, disabled, readOnly, required, invalid, direction,
variant, fullWidth, name and form. Values and bounds are ISO local time strings
accepted by @internationalized/date parseTime. Complete change requests use Time's
canonical serialization (including seconds); empty strings denote incomplete
values. Undisplayed seconds/milliseconds are preserved. This is local wall time,
without a date, zone or daylight-saving disambiguation.

hourCycle accepts an empty string for locale inference, h11, h12, h23 or h24.
granularity accepts hour, minute or second. Locale controls field order, digits,
separators and day-period labels. The existing Adobe IncompleteDate pure model
handles cycle-specific hours, independently editable day periods, partial drafts
and placeholder initialization. A fixed internal calendar date provides Intl
formatting; it is never submitted as part of the time value.

TimeField supplies the ready composition. TimeFieldRoot, TimeFieldInput,
TimeFieldLabel, TimeFieldDescription and TimeFieldError expose its parts.
TimeFieldInput shares the DateInputGroup owner with time metadata. Native
spinbutton text inputs remain read-only before initialization. The clipped text
proxy alone owns name/required/form association. The application owns accepted
values, controlled reset and other callbacks. Left/Right follow direction;
Up/Down cycle, Page keys step hours by 2 and minutes/seconds by 15, Home/End choose
bounds, and Backspace/Delete clear. English or localized day-period prefixes can
select AM/PM; unsupported text restores the existing draft.

The isolated consumer /tmp/lenso-ui-exact-time-field-20261112 builds against the
configured unmodified Exact pin 956ae33a35ffa5313d7be3cebc55ed84f9480e0a, using the
existing SDK archive (no fresh Git metadata identity claim), with six existing
warnings. Chromium 156 and WebKit 27.2 pass native editing, midnight wrap,
day periods, 12/24-hour layout switching, second precision, clear/retype,
controlled rejection, flags, Arabic digits, RTL keyboard movement, label focus,
external scalar native forms, required/range validity, external replacement,
removal/remount and native mobile-browser tap focus. Sixteen screenshots cover
both engines, themes, widths and h12/h23; representative narrow light and desktop
dark images were inspected. The same consumer passes the full DateField browser
regression. Receipts are in .cache/acceptance/time-field/ and
time-field-date-regression/, with actual app.js and Web runtime response hashes.
Unit checks pass 87 tests / 402 assertions; typechecking covers 151 files.

The family remains Partial. Date/zoned time values, daylight-saving transitions, a
combined date-time input, full source callbacks, caller styling, localized
placeholders, broad day-period typing/bidi layouts, constrained keyboard
incrementing, pre-hatch and native/device acceptance remain unqualified. h11/h24,
hour-only granularity and locale-inferred cycles have pure-model or source scope,
not the full rendered browser matrix. Browser taps do not establish physical
phone or assistive-technology acceptance. No performance equivalence is claimed.
