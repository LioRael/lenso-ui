> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Calendar for Exact Web

Calendar supplies a localized single-month grid with explicit application-owned
selection. CalendarState declares id, label, value (ISO date strings), focused,
placeholder, today, locale, calendar, firstDay, weekdayStyle, selectionMode,
min/max, unavailable, disabled, readOnly, invalid and direction. An empty calendar
uses the locale's calendar; firstDay is empty for locale inference or sun through
sat. weekdayStyle is narrow, short or long. selectionMode is single, multiple or
none. today is explicit, so server/client clocks cannot silently disagree.

The native day buttons derive from canonical primitives-exact Toggle. Its actual
button, controlled boolean activation and MIT/source notices remain intact; a
Contract action maps that intent to single/multiple ISO arrays. Exact owns the
keyed week/day nodes and selection. The Web owner requests a scalar layout and
decorates existing heading, weekday and day-label nodes; it never creates or
moves Exact-owned grid nodes. Controlled rejection leaves accepted selection
unchanged. Unavailable/bounded/disabled dates use native disabled buttons;
read-only and none retain browsing while blocking selection.

CalendarDate and Intl formatting from the pinned @internationalized/date package
supply calendar conversion, leap years, complete week boundaries, localized
weekday/day labels and full date names. Month titles retain the source
getFormattableMonth adjustment. Default year bounds retain Lenso's existing
calendar-offset policy (1900–2099 in the corresponding calendar approximation);
explicit ISO bounds override them. The grid displays complete weeks, including
adjacent-month days, with one roving in-month tab stop.

Arrow keys move by day/week with direction-aware horizontal motion; PageUp/Down
move by calendar month and Shift adds calendar-year movement. Home/End target
locale week boundaries. Focus clamps to min/max; unavailable targets are skipped
within the bounds. Native Enter/Space selects. Month navigation preserves an
existing navigation-button focus; it does not force focus into the grid. The
focused prop provides an external reset anchor; it is not a full focus-change
callback interface. Changing locale/calendar also resets from the declared
anchor. Public parts are CalendarRoot, Header, Heading, NavButton, Grid,
HeaderCell and Cell. Calendar is their ready composition.

Shared calendar StyleX recipes supply geometry, ordinary surfaces, typography,
today/selected/outside/unavailable states and RTL icons. The Persian example uses
narrow weekday labels because short weekday names exceed a 338px grid's columns.
A native Web attribute journal supplies aria-readonly and aria-multiselectable
on the grid: the pinned Contract compiler cannot author those attributes.
Before the hatch initializes, the calendar has an empty grid and disabled month
navigation. Accessibility initialization depends on the Web adapter.

The sealed consumer /tmp/lenso-ui-exact-calendar-weekdays-20261112 builds against
the configured unmodified SDK pin 956ae33a35ffa5313d7be3cebc55ed84f9480e0a from the
existing metadata-free archive, with six existing warnings. Pure/unit checks pass
91 tests / 437 assertions; typechecking covers 155 files. Chromium 156 / WebKit 27.2 pass compiled consumer checks for native single/multiple/
none activation, rejection, flags, limits/unavailable days, roving and calendar
month/year/week keyboard focus, locale/Persian display and RTL movement,
external replacement, disposal/remount and native mobile-browser taps. Grid
read-only/multiselect attributes are inspected on the actual native nodes.
Sixteen captures cover both engines, widths, themes and US/Persian locales;
weekday column overflow and selected fill are measured. Representative actual
narrow US/Persian and desktop dark images were inspected. Receipts in
.cache/acceptance/calendar-weekdays/ include actual application and Web-runtime
response hashes. Native browser taps do not establish physical-device or
assistive-technology acceptance.

The first source candidate exposed unsupported array addition and ARIA attributes
at compilation. It did not reach browser acceptance; the final version uses
supported concat plus the explicit grid attribute journal. An earlier WebKit
fixture assumed pointer clicks focus buttons. The final focus-retention check
uses native keyboard activation, without changing platform pointer focus policy.

Remaining work: date-range/drag gestures, CalendarYearPicker, visible-duration and
multiple-month layouts, full focus/selection callbacks, source indicators and
caller composition/style matrices, native form integration through date pickers,
automatic validation summaries, full era/calendar/extreme-boundary behavior,
pre-hatch accessibility and native/device/assistive-technology acceptance. This
family remains Partial. No performance or native-rendering parity is claimed.
