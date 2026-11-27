import { calendarStyles } from "@lenso/tokens/calendar";
import {
  Calendar as SdkRoot,
  createCalendarController,
  type CalendarController,
  type CalendarState,
  CalendarHeading as SdkHeading,
  CalendarPrevious as SdkPrevious,
  CalendarNext as SdkNext,
  CalendarGrid as SdkGrid,
  CalendarWeekdays as SdkWeekdays,
  CalendarWeekday as SdkWeekday,
  CalendarWeeks as SdkWeeks,
  CalendarDay as SdkDay,
  CalendarMonthSelect as SdkMonthSelect,
} from "@ui-sdk/vue/calendar";
import { defineComponent, h, inject, type PropType } from "vue";
import { calendarYearPickerStyles } from "@lenso/tokens/calendar-year-picker";
import {
  CalendarYearPicker,
  YearProvider,
  YearPickerContext,
  yearPickerProps,
  type YearPickerOptions,
} from "./calendar-year-picker.js";
import {
  forwardPart,
  htmlPart,
  partAttributes,
  sdkPart,
  type HtmlPart,
  type StyledPart,
  type ComponentProps,
  type StyleXArgument,
} from "./parts.js";

export { createCalendarController, type CalendarValue } from "@ui-sdk/vue/calendar";
const BaseCalendar: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "calendar",
  () => calendarStyles.root,
);
type CalendarOptions = YearPickerOptions & {
  selectionMode?: ComponentProps<typeof BaseCalendar>["mode"];
};
export const CalendarRoot: StyledPart<typeof SdkRoot, CalendarOptions> = defineComponent({
  name: "LensoCalendar",
  inheritAttrs: false,
  props: {
    ...yearPickerProps,
    mode: String as PropType<CalendarOptions["selectionMode"]>,
    selectionMode: String as PropType<CalendarOptions["selectionMode"]>,
    controller: Object as PropType<CalendarController>,
    min: String,
    max: String,
    locale: String,
  },
  emits: { "update:isYearPickerOpen": (_value: boolean) => true },
  setup(props, { attrs, emit, slots }) {
    const own = createCalendarController();
    return () => {
      const controller = props.controller ?? own;
      const scoped = {
        ...slots,
        default: slots["default"]
          ? (scope: { state: CalendarState }) =>
              h(
                YearProvider,
                {
                  state: scope.state,
                  calendar: controller,
                  min: props.min,
                  max: props.max,
                  locale: props.locale,
                  isYearPickerOpen: props.isYearPickerOpen,
                  defaultYearPickerOpen: props.defaultYearPickerOpen,
                  onYearPickerOpenChange: props.onYearPickerOpenChange,
                  "onUpdate:isYearPickerOpen": (value) => emit("update:isYearPickerOpen", value),
                },
                { default: () => slots["default"]?.(scope) },
              )
          : undefined,
      };
      return h(
        BaseCalendar,
        {
          ...attrs,
          mode: props.mode ?? props.selectionMode,
          controller,
          min: props.min,
          max: props.max,
          locale: props.locale,
        },
        scoped,
      );
    };
  },
}) as unknown as StyledPart<typeof SdkRoot, CalendarOptions>;
export const CalendarHeader = htmlPart("div", "calendar-header", () => calendarStyles.header);
export const CalendarHeading: StyledPart<typeof SdkHeading> = sdkPart(
  SdkHeading,
  "calendar-heading",
  () => calendarStyles.heading,
);
export const CalendarPrevious: StyledPart<typeof SdkPrevious> = sdkPart(
  SdkPrevious,
  "calendar-previous",
  () => calendarStyles.navButton,
);
export const CalendarNext: StyledPart<typeof SdkNext> = sdkPart(
  SdkNext,
  "calendar-next",
  () => calendarStyles.navButton,
);
export const CalendarWeekdays: typeof SdkWeekdays = forwardPart(SdkWeekdays);
export const CalendarWeekday: StyledPart<typeof SdkWeekday> = sdkPart(
  SdkWeekday,
  "calendar-weekday",
  () => calendarStyles.headerCell,
);
export const CalendarWeeks: typeof SdkWeeks = forwardPart(SdkWeeks);
export const CalendarDay: StyledPart<typeof SdkDay> = sdkPart(SdkDay, "calendar-day", () => [
  calendarStyles.cell,
  calendarStyles.nativeDay,
]);
export const CalendarMonthSelect: typeof SdkMonthSelect = forwardPart(SdkMonthSelect);
export { CalendarYearPicker as CalendarYearSelect } from "./calendar-year-picker.js";
const CalendarYearSelect: typeof CalendarYearPicker = CalendarYearPicker;
const Grid: StyledPart<typeof SdkGrid> = sdkPart(
  SdkGrid,
  "calendar-grid",
  () => calendarStyles.nativeGrid,
);
export const CalendarGrid = defineComponent({
  name: "LensoCalendarGrid",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const picker = inject(YearPickerContext, undefined);
    return () =>
      h(
        Grid,
        {
          ...attrs,
          inert: picker?.open() || (attrs["inert"] as boolean | undefined),
          "aria-hidden": picker?.open()
            ? "true"
            : (attrs["aria-hidden"] as "true" | "false" | undefined),
          xstyle: [
            picker?.open() && calendarYearPickerStyles.dayGridHidden,
            attrs["xstyle"] as StyleXArgument,
          ],
        },
        {
          ...slots,
          default:
            slots["default"] ??
            (() => [
              h(CalendarWeekdays, null, {
                default: ({ index }: { index: number }) => h(CalendarWeekday, { index }),
              }),
              h(CalendarWeeks, null, {
                default: ({ cell }: { cell: { date: string } }) =>
                  h(CalendarDay, { value: cell.date }),
              }),
            ]),
        },
      );
  },
}) as unknown as typeof Grid;

export const CalendarCell: typeof CalendarDay = CalendarDay;
export const CalendarGridBody: typeof CalendarWeeks = CalendarWeeks;
export const CalendarGridHeader: typeof CalendarWeekdays = CalendarWeekdays;
export const CalendarHeaderCell: typeof CalendarWeekday = CalendarWeekday;
export const CalendarNavButton: typeof CalendarNext = defineComponent({
  name: "LensoCalendarNavButton",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => h(attrs["slot"] === "previous" ? CalendarPrevious : CalendarNext, attrs, slots);
  },
}) as unknown as typeof CalendarNext;
export const CalendarCellIndicator: HtmlPart<"span"> = defineComponent({
  name: "LensoCalendarCellIndicator",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        "span",
        partAttributes(
          "calendar-cell-indicator",
          [calendarStyles.indicator, calendarStyles.nativeIndicator],
          { "aria-hidden": "true", ...attrs },
        ),
        slots["default"]?.(),
      );
  },
}) as unknown as HtmlPart<"span">;

export const calendarParts: {
  YearPickerTrigger: typeof CalendarYearPicker.Trigger;
  YearPickerTriggerHeading: typeof CalendarYearPicker.TriggerHeading;
  YearPickerTriggerIndicator: typeof CalendarYearPicker.TriggerIndicator;
  YearPickerGrid: typeof CalendarYearPicker.Grid;
  YearPickerGridBody: typeof CalendarYearPicker.GridBody;
  YearPickerCell: typeof CalendarYearPicker.Cell;
  Cell: typeof CalendarCell;
  CellIndicator: typeof CalendarCellIndicator;
  GridBody: typeof CalendarGridBody;
  GridHeader: typeof CalendarGridHeader;
  HeaderCell: typeof CalendarHeaderCell;
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
} = {
  YearPickerTrigger: CalendarYearPicker.Trigger,
  YearPickerTriggerHeading: CalendarYearPicker.TriggerHeading,
  YearPickerTriggerIndicator: CalendarYearPicker.TriggerIndicator,
  YearPickerGrid: CalendarYearPicker.Grid,
  YearPickerGridBody: CalendarYearPicker.GridBody,
  YearPickerCell: CalendarYearPicker.Cell,
  Cell: CalendarCell,
  CellIndicator: CalendarCellIndicator,
  GridBody: CalendarGridBody,
  GridHeader: CalendarGridHeader,
  HeaderCell: CalendarHeaderCell,
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
};

export const Calendar: typeof CalendarRoot & typeof calendarParts = Object.assign(
  CalendarRoot,
  calendarParts,
);

export {
  YearPickerContext,
  useYearPicker,
  useCalendarOrRangeState,
} from "./calendar-year-picker.js";
