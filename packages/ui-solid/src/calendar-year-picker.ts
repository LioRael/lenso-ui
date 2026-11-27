import { Calendar } from "./calendar.jsx";

export { createModelController as createCalendarYearPickerController } from "@lenso/primitives/model-control";
export {
  CalendarYearPickerTrigger,
  CalendarYearPickerTriggerHeading,
  CalendarYearPickerTriggerIndicator,
  CalendarYearPickerGrid,
  CalendarYearPickerGridBody,
  CalendarYearPickerCell,
} from "./year-picker.jsx";
export const CalendarYearPicker = Object.assign(Calendar.YearSelect, {
  Trigger: Calendar.YearPickerTrigger,
  TriggerHeading: Calendar.YearPickerTriggerHeading,
  TriggerIndicator: Calendar.YearPickerTriggerIndicator,
  Grid: Calendar.YearPickerGrid,
  GridBody: Calendar.YearPickerGridBody,
  Cell: Calendar.YearPickerCell,
});

export { YearPickerContext, useYearPicker, useCalendarOrRangeState } from "./year-picker.jsx";
