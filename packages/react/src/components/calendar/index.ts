/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
import type { ComponentProps } from "react";
import {
  CalendarRoot,
  CalendarHeader,
  CalendarHeadingPart as CalendarHeading,
  CalendarNavButton,
  CalendarGrid,
  CalendarGridHeader,
  CalendarGridBody,
  CalendarHeaderCellPart as CalendarHeaderCell,
  CalendarCell,
  CalendarCellIndicator,
} from "./calendar.js";
import { CalendarYearPicker } from "../calendar-year-picker/index.js";
export {
  CalendarRoot,
  CalendarHeader,
  CalendarHeading,
  CalendarNavButton,
  CalendarGrid,
  CalendarGridHeader,
  CalendarGridBody,
  CalendarHeaderCell,
  CalendarCell,
  CalendarCellIndicator,
};
export type { CalendarRootProps, CalendarRootProps as CalendarProps } from "./calendar.js";
export type CalendarHeaderProps = ComponentProps<typeof CalendarHeader>;
export type CalendarHeadingProps = ComponentProps<typeof CalendarHeading>;
export type CalendarNavButtonProps = ComponentProps<typeof CalendarNavButton>;
export type CalendarGridProps = ComponentProps<typeof CalendarGrid>;
export type CalendarGridHeaderProps = ComponentProps<typeof CalendarGridHeader>;
export type CalendarGridBodyProps = ComponentProps<typeof CalendarGridBody>;
export type CalendarHeaderCellProps = ComponentProps<typeof CalendarHeaderCell>;
export type CalendarCellProps = ComponentProps<typeof CalendarCell>;
export type CalendarCellIndicatorProps = ComponentProps<typeof CalendarCellIndicator>;
export {
  YearPickerContext,
  useYearPicker,
  useCalendarOrRangeState,
} from "../calendar-year-picker/index.js";
export type { CalendarSelectionMode } from "react-aria-components/Calendar";
export const Calendar = Object.assign(CalendarRoot, {
  Root: CalendarRoot,
  Header: CalendarHeader,
  Heading: CalendarHeading,
  NavButton: CalendarNavButton,
  Grid: CalendarGrid,
  GridHeader: CalendarGridHeader,
  GridBody: CalendarGridBody,
  HeaderCell: CalendarHeaderCell,
  Cell: CalendarCell,
  CellIndicator: CalendarCellIndicator,
  YearPickerTrigger: CalendarYearPicker.Trigger,
  YearPickerTriggerHeading: CalendarYearPicker.TriggerHeading,
  YearPickerTriggerIndicator: CalendarYearPicker.TriggerIndicator,
  YearPickerGrid: CalendarYearPicker.Grid,
  YearPickerGridBody: CalendarYearPicker.GridBody,
  YearPickerCell: CalendarYearPicker.Cell,
});
