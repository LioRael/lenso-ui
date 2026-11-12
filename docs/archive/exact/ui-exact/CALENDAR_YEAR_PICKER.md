> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# CalendarYearPicker for Exact Web

CalendarYearPicker composes inside the existing CalendarRoot. The trigger replaces
CalendarHeading in CalendarHeader; CalendarGrid and CalendarYearPickerGrid are
siblings under that root. Both use the same focused date, calendar conversion and
bounds owner. Choosing a year changes the browsed date; it never selects a date
or writes the application's CalendarState.value.

CalendarYearPickerState declares id, open and visibleYears. The application owns
open through the change(bool) action. A rejected toggle leaves visibility as
accepted; a rejected close can keep the year grid open after browsing another
year. visibleYears is a nonnegative integer: positive counts center the source
year window, and zero uses all bounded years (200 with ordinary default bounds).
The source calendarYears policy retains era-aware labels, bound alignment and
calendar arithmetic. Its generated date anchors can clamp month/day around
bounds and non-leap years; choosing a year preserves that source browsing policy,
without altering selected ISO dates.

Public parts are CalendarYearPickerTrigger(calendar, state, change),
CalendarYearPickerTriggerHeading(calendar),
CalendarYearPickerTriggerIndicator(open), CalendarYearPickerGrid(state, change),
and CalendarYearPickerCell(id, date, change). Grid owns a Host-rendered keyed
skeleton; the cell's date identity comes from the source year model. The ready
composition is in example/calendar-year-picker.contract. Custom external grid
bodies, formatting/offsets and rich cell composition remain unfinished.

The trigger and cell native buttons derive from canonical primitive Toggle and
retain its MIT notice and source fingerprints. The trigger's boolean inversion
requests application-owned visibility. Year activation is a Web navigation
extension using the shared Calendar focus owner; it consumes the native click
rather than adding a competing date-selection state. The source pure year model
adapts Lenso's React Aria 3.52.1 helper, Copyright 2026 Adobe, Apache-2.0, and uses
public @internationalized/date operations. No React hook or SDK/primitive change
is introduced. Source CalendarYearPicker recipes supply the three-column grid,
32px year cells, selected tint, header indicator and reduced-motion opacity.

Opening schedules focus to the browsed year after Exact commits its update.
Left/Right follow direction, Up/Down move three cells, Home/End choose list bounds,
and native Enter/Space browses the chosen year. Escape and accepted year
activation close the grid and schedule focus back to the trigger. The underlying
day grid is inert and hidden from accessibility while open; month navigation is
hidden and excluded from tab order. Grid geometry follows the existing day grid.
The owner journals native attributes, text, geometry and hidden presentation,
restores them on removal and cancels its pending focus frame on disposal.

The first browser probe exposed immediate focus being overwritten by Exact's
subsequent update. The final implementation follows the source's animation-frame
focus timing. Label text inherits the source 14px cell font. The indicator uses
its source-sized chevron, with parent rotation rather than the month-navigation
RTL transform. Initial closed styles are compiled; initial open layout and focus
still depend on Web initialization.

The family remains Partial. Full formatting/body/offset/callback and caller-style
composition, multiple picker scopes within one calendar, extreme era/boundary
cases, focus-frame reversals, nested overlay integration, scroll/performance
qualification, pre-hatch accessibility and native/device/assistive-technology
acceptance remain open. No performance or native-rendering parity is claimed.
