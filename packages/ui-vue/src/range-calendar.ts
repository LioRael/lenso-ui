import { rangeCalendarStyles } from "@lenso/tokens/range-calendar";
import { defineComponent, h } from "vue";
import { Calendar, CalendarRoot, calendarParts } from "./calendar.js";
import type { ComponentProps, StyleXArgument } from "./parts.js";

export type RangeCalendarProps = Omit<ComponentProps<typeof CalendarRoot>, "mode">;
export const RangeCalendarRoot = defineComponent({
  name: "LensoRangeCalendar",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        CalendarRoot,
        {
          ...attrs,
          mode: "range",
          xstyle: [rangeCalendarStyles.root, attrs["xstyle"] as StyleXArgument],
        },
        slots,
      );
  },
}) as unknown as new () => Omit<InstanceType<typeof CalendarRoot>, "$props"> & {
  $props: RangeCalendarProps;
};

export const RangeCalendar: typeof RangeCalendarRoot &
  Omit<typeof calendarParts, "Root"> & { Root: typeof RangeCalendarRoot } = Object.assign(
  RangeCalendarRoot,
  calendarParts,
  {
    Root: RangeCalendarRoot,
  },
);

export {
  createCalendarController as createRangeCalendarController,
  type CalendarController as RangeCalendarController,
} from "@ui-sdk/vue/calendar";

export const RangeCalendarCell: typeof Calendar.Cell = Calendar.Cell;
export const RangeCalendarCellIndicator: typeof Calendar.CellIndicator = Calendar.CellIndicator;
export const RangeCalendarGrid: typeof Calendar.Grid = Calendar.Grid;
export const RangeCalendarGridBody: typeof Calendar.GridBody = Calendar.GridBody;
export const RangeCalendarGridHeader: typeof Calendar.GridHeader = Calendar.GridHeader;
export const RangeCalendarHeader: typeof Calendar.Header = Calendar.Header;
export const RangeCalendarHeaderCell: typeof Calendar.HeaderCell = Calendar.HeaderCell;
export const RangeCalendarHeading: typeof Calendar.Heading = Calendar.Heading;
export const RangeCalendarNavButton: typeof Calendar.NavButton = Calendar.NavButton;

export {
  YearPickerContext,
  useYearPicker,
  useCalendarOrRangeState,
} from "./calendar-year-picker.js";
