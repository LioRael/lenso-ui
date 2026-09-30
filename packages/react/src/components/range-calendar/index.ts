/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
import type { ComponentProps } from "react";
import {
  RangeCalendarRoot,
  RangeCalendarHeader,
  RangeCalendarHeading,
  RangeCalendarNavButton,
  RangeCalendarGrid,
  RangeCalendarGridHeader,
  RangeCalendarGridBody,
  RangeCalendarHeaderCell,
  RangeCalendarCell,
  RangeCalendarCellIndicator,
} from "./range-calendar.js";
import { CalendarYearPicker } from "../calendar-year-picker/index.js";
export {
  RangeCalendarRoot,
  RangeCalendarHeader,
  RangeCalendarHeading,
  RangeCalendarNavButton,
  RangeCalendarGrid,
  RangeCalendarGridHeader,
  RangeCalendarGridBody,
  RangeCalendarHeaderCell,
  RangeCalendarCell,
  RangeCalendarCellIndicator,
};
export type {
  RangeCalendarRootProps,
  RangeCalendarRootProps as RangeCalendarProps,
} from "./range-calendar.js";
export type RangeCalendarHeaderProps = ComponentProps<typeof RangeCalendarHeader>;
export type RangeCalendarHeadingProps = ComponentProps<typeof RangeCalendarHeading>;
export type RangeCalendarNavButtonProps = ComponentProps<typeof RangeCalendarNavButton>;
export type RangeCalendarGridProps = ComponentProps<typeof RangeCalendarGrid>;
export type RangeCalendarGridHeaderProps = ComponentProps<typeof RangeCalendarGridHeader>;
export type RangeCalendarGridBodyProps = ComponentProps<typeof RangeCalendarGridBody>;
export type RangeCalendarHeaderCellProps = ComponentProps<typeof RangeCalendarHeaderCell>;
export type RangeCalendarCellProps = ComponentProps<typeof RangeCalendarCell>;
export type RangeCalendarCellIndicatorProps = ComponentProps<typeof RangeCalendarCellIndicator>;
export {
  YearPickerContext,
  useYearPicker,
  useCalendarOrRangeState,
} from "../calendar-year-picker/index.js";
export const RangeCalendar = Object.assign(RangeCalendarRoot, {
  Root: RangeCalendarRoot,
  Header: RangeCalendarHeader,
  Heading: RangeCalendarHeading,
  NavButton: RangeCalendarNavButton,
  Grid: RangeCalendarGrid,
  GridHeader: RangeCalendarGridHeader,
  GridBody: RangeCalendarGridBody,
  HeaderCell: RangeCalendarHeaderCell,
  Cell: RangeCalendarCell,
  CellIndicator: RangeCalendarCellIndicator,
  YearPickerTrigger: CalendarYearPicker.Trigger,
  YearPickerTriggerHeading: CalendarYearPicker.TriggerHeading,
  YearPickerTriggerIndicator: CalendarYearPicker.TriggerIndicator,
  YearPickerGrid: CalendarYearPicker.Grid,
  YearPickerGridBody: CalendarYearPicker.GridBody,
  YearPickerCell: CalendarYearPicker.Cell,
});
