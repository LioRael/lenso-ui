import CalendarNavButton from "./calendar-nav-button.svelte";
export { CalendarNavButton };
import CalendarCellIndicator from "./calendar-cell-indicator.svelte";
export { CalendarCellIndicator };
import { CalendarYearPicker } from "../calendar-year-picker/index.js";
import CalendarRoot from "./calendar-root.svelte";
import CalendarHeader from "./calendar-header.svelte";
import CalendarHeading from "./calendar-heading.svelte";
import CalendarPrevious from "./calendar-previous.svelte";
import CalendarNext from "./calendar-next.svelte";
import CalendarGrid from "./calendar-grid.svelte";
import CalendarWeekdays from "./calendar-weekdays.svelte";
import CalendarWeekday from "./calendar-weekday.svelte";
import CalendarWeeks from "./calendar-weeks.svelte";
import CalendarDay from "./calendar-day.svelte";
import CalendarMonthSelect from "./calendar-month-select.svelte";
import CalendarYearSelect from "./calendar-year-select.svelte";

export { createCalendarController } from "@ui-sdk/svelte/calendar";
export {
  CalendarRoot,
  CalendarHeader,
  CalendarHeading,
  CalendarPrevious,
  CalendarNext,
  CalendarGrid,
  CalendarWeekdays,
  CalendarWeekday,
  CalendarWeeks,
  CalendarDay,
  CalendarMonthSelect,
  CalendarYearSelect,
};
export const Calendar: typeof CalendarRoot & {
  YearPickerTrigger: typeof CalendarYearPicker.Trigger;
  YearPickerTriggerHeading: typeof CalendarYearPicker.TriggerHeading;
  YearPickerTriggerIndicator: typeof CalendarYearPicker.TriggerIndicator;
  YearPickerGrid: typeof CalendarYearPicker.Grid;
  YearPickerGridBody: typeof CalendarYearPicker.GridBody;
  YearPickerCell: typeof CalendarYearPicker.Cell;
  CellIndicator: typeof CalendarCellIndicator;
  Cell: typeof CalendarDay;
  GridBody: typeof CalendarWeeks;
  GridHeader: typeof CalendarWeekdays;
  HeaderCell: typeof CalendarWeekday;
  NavButton: typeof CalendarNavButton;
  Root: typeof CalendarRoot;
  Header: typeof CalendarHeader;
  Heading: typeof CalendarHeading;
  Previous: typeof CalendarPrevious;
  Next: typeof CalendarNext;
  Grid: typeof CalendarGrid;
  Weekdays: typeof CalendarWeekdays;
  Weekday: typeof CalendarWeekday;
  Weeks: typeof CalendarWeeks;
  Day: typeof CalendarDay;
  MonthSelect: typeof CalendarMonthSelect;
  YearSelect: typeof CalendarYearSelect;
} = Object.assign(CalendarRoot, {
  YearPickerTrigger: CalendarYearPicker.Trigger,
  YearPickerTriggerHeading: CalendarYearPicker.TriggerHeading,
  YearPickerTriggerIndicator: CalendarYearPicker.TriggerIndicator,
  YearPickerGrid: CalendarYearPicker.Grid,
  YearPickerGridBody: CalendarYearPicker.GridBody,
  YearPickerCell: CalendarYearPicker.Cell,
  CellIndicator: CalendarCellIndicator,
  Cell: CalendarDay,
  GridBody: CalendarWeeks,
  GridHeader: CalendarWeekdays,
  HeaderCell: CalendarWeekday,
  NavButton: CalendarNavButton,
  Root: CalendarRoot,
  Header: CalendarHeader,
  Heading: CalendarHeading,
  Previous: CalendarPrevious,
  Next: CalendarNext,
  Grid: CalendarGrid,
  Weekdays: CalendarWeekdays,
  Weekday: CalendarWeekday,
  Weeks: CalendarWeeks,
  Day: CalendarDay,
  MonthSelect: CalendarMonthSelect,
  YearSelect: CalendarYearSelect,
});

export const CalendarCell: typeof Calendar.Cell = Calendar.Cell;

export const CalendarGridBody: typeof Calendar.GridBody = Calendar.GridBody;

export const CalendarGridHeader: typeof Calendar.GridHeader = Calendar.GridHeader;

export const CalendarHeaderCell: typeof Calendar.HeaderCell = Calendar.HeaderCell;

export {
  YearPickerContext,
  useYearPicker,
  useCalendarOrRangeState,
} from "../calendar-year-picker/context.js";
