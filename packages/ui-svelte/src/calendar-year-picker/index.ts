import CalendarYearSelect from "../calendar/calendar-year-select.svelte";
import CalendarYearPickerTrigger from "./trigger.svelte";
import CalendarYearPickerTriggerHeading from "./trigger-heading.svelte";
import CalendarYearPickerTriggerIndicator from "./trigger-indicator.svelte";
import CalendarYearPickerGrid from "./grid.svelte";
import CalendarYearPickerGridBody from "./grid-body.svelte";
import CalendarYearPickerCell from "./cell.svelte";

export {
  CalendarYearPickerTrigger,
  CalendarYearPickerTriggerHeading,
  CalendarYearPickerTriggerIndicator,
  CalendarYearPickerGrid,
  CalendarYearPickerGridBody,
  CalendarYearPickerCell,
};
export type { CalendarYearPickerTriggerRenderProps } from "./trigger.svelte";
export type { CalendarYearPickerGridProps } from "./grid.svelte";
export type { CalendarYearPickerCellProps, CalendarYearPickerCellRenderProps } from "./cell.svelte";
export { createModelController as createCalendarYearPickerController } from "@lenso/primitives/model-control";
export type {
  ModelController as CalendarYearPickerController,
  ModelChangeReason as CalendarYearPickerChangeReason,
} from "@lenso/primitives/model-control";

export const CalendarYearPicker: typeof CalendarYearSelect & {
  Trigger: typeof CalendarYearPickerTrigger;
  TriggerHeading: typeof CalendarYearPickerTriggerHeading;
  TriggerIndicator: typeof CalendarYearPickerTriggerIndicator;
  Grid: typeof CalendarYearPickerGrid;
  GridBody: typeof CalendarYearPickerGridBody;
  Cell: typeof CalendarYearPickerCell;
} = Object.assign(CalendarYearSelect, {
  Trigger: CalendarYearPickerTrigger,
  TriggerHeading: CalendarYearPickerTriggerHeading,
  TriggerIndicator: CalendarYearPickerTriggerIndicator,
  Grid: CalendarYearPickerGrid,
  GridBody: CalendarYearPickerGridBody,
  Cell: CalendarYearPickerCell,
});

export {
  YearPickerContext,
  useYearPicker,
  useCalendarOrRangeState,
} from "../calendar-year-picker/context.js";
