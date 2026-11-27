import { Calendar } from "../calendar/index.js";
import RangeCalendarRoot from "./range-calendar.svelte";

export { RangeCalendarRoot };
export type { RangeCalendarProps } from "./range-calendar.svelte";
export const RangeCalendar: typeof RangeCalendarRoot &
  Omit<typeof Calendar, "Root"> & { Root: typeof RangeCalendarRoot } = Object.assign(
  RangeCalendarRoot,
  Calendar,
  { Root: RangeCalendarRoot },
);

export {
  createCalendarController as createRangeCalendarController,
  type CalendarController as RangeCalendarController,
} from "@ui-sdk/core/calendar";

export const RangeCalendarCell: typeof RangeCalendar.Cell = RangeCalendar.Cell;

export const RangeCalendarCellIndicator: typeof RangeCalendar.CellIndicator =
  RangeCalendar.CellIndicator;

export const RangeCalendarGrid: typeof RangeCalendar.Grid = RangeCalendar.Grid;

export const RangeCalendarGridBody: typeof RangeCalendar.GridBody = RangeCalendar.GridBody;

export const RangeCalendarGridHeader: typeof RangeCalendar.GridHeader = RangeCalendar.GridHeader;

export const RangeCalendarHeader: typeof RangeCalendar.Header = RangeCalendar.Header;

export const RangeCalendarHeaderCell: typeof RangeCalendar.HeaderCell = RangeCalendar.HeaderCell;

export const RangeCalendarHeading: typeof RangeCalendar.Heading = RangeCalendar.Heading;

export const RangeCalendarNavButton: typeof RangeCalendar.NavButton = RangeCalendar.NavButton;

export {
  YearPickerContext,
  useYearPicker,
  useCalendarOrRangeState,
} from "../calendar-year-picker/context.js";
