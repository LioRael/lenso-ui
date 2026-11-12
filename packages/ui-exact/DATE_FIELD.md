# DateField and DateInputGroup for Exact Web

The date-only foundation uses @internationalized/date 3.12.4 for CalendarDate
identity, calendar conversion and ISO validation. Its draft behavior adapts the
pure IncompleteDate model from react-stately 3.51.0, retaining the Adobe 2026
Apache-2.0 notice and a source SHA256 in date-incomplete.provenance.json.
Incomplete and temporarily invalid dates preserve segment intent until complete;
a complete invalid date normalizes when focus leaves the group.
Its actual segment input derives from the canonical primitive Input, with the
full generated MIT notice and source fingerprint. No React state hook, headless
package change or SDK patch is introduced.

DateFieldState declares id, label, description, error, ISO value, placeholder ISO
date, locale, calendar (empty uses locale), min/max ISO dates, disabled/readOnly/
required/invalid, direction, primary/secondary variant, fullWidth, name and form.
An empty value is incomplete. The application owns the scalar value; change
proposes a complete ISO date or an empty string after clearing a segment. Draft
parts preserve the other fields until completion. Rejected requests reconcile to
the accepted value. This first adapter is date-only; time/zoned and range models
remain separate unfinished work.

DateField is the ready composition of DateFieldRoot, DateFieldLabel,
DateInputGroup, DateFieldDescription and DateFieldError. DateInputGroupRoot and
DateInputGroupInput expose composition with Prefix/Suffix. The input skeleton is
Host-owned and keyed by segment identity. A scalar layout request updates that
skeleton to Intl field order; the adapter fills the native input display and
empty literal boxes. It never moves Host-owned nodes itself. Segments are native
spinbutton text inputs; labels, values/ranges, localized display and partial
placeholders initialize in the Web hatch. Initial segment controls are read-only.

Left/Right follow direction; Up/Down cycle, Page keys use the source date steps,
Home/End choose segment bounds and Backspace/Delete clear a segment. Pointer
focus and the label redirect to an editable segment. A clipped text proxy owns
native form name, required validity and external form association; segments do
not submit duplicate fields. Controlled reset policy remains application-owned.

Shared DateField/DateInputGroup recipes supply ordinary editing surfaces and
semantics.

The isolated stock-SDK consumer passes Chromium 156 / WebKit 27.2 checks for leap-day
draft preservation and blur normalization, clear/retype, rejected updates,
disabled/read-only controls, locale order and Persian-calendar display without
changing ISO identity, RTL focus, labels, scalar external forms, required/range
validity, external updates, disposal/remount and native mobile-browser taps.
Sixteen captures cover both engines, themes, widths and ordinary surface variants;
representative narrow light and desktop dark images were inspected. Actual app.js
and Web-runtime response hashes are recorded in
.cache/acceptance/date-field-form/verification.json. This consumer builds with
six existing SDK warnings. Pure/unit coverage passes 84 tests / 362 assertions;
typechecking covers 148 files.

The fixture associates a separate native form through authored state. Directly
changing a Host-owned attribute in the fixture was overwritten by the next
application redraw; that failed fixture did not establish missing native validity.

This remains Partial. Time/zoned/range models, date pickers and calendars,
textual era editing, localized placeholders, broader callbacks/caller styling,
pre-hatch behavior, min/max keyboard constraints, complete source API and
native/device acceptance remain unfinished. Initial segments deliberately stay
read-only until the Web owner initializes. No speed or native parity claim is made.
