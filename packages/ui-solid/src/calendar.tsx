import * as Years from "./year-picker.jsx";
import { useContext, omit, type ComponentProps } from "solid-js";
import { createCalendarController } from "@ui-sdk/solid/calendar";
import { calendarYearPickerStyles } from "@lenso/tokens/calendar-year-picker";
import { YearContext, YearProvider, type YearPickerOptions } from "./year-picker.jsx";
import { calendarStyles } from "@lenso/tokens/calendar";
import {
  Calendar as SdkRoot,
  CalendarHeading as SdkHeading,
  CalendarPrevious as SdkPrevious,
  CalendarNext as SdkNext,
  CalendarGrid as SdkGrid,
  CalendarWeekdays as SdkWeekdays,
  CalendarWeekday as SdkWeekday,
  CalendarWeeks as SdkWeeks,
  CalendarDay as SdkDay,
  CalendarMonthSelect as SdkMonthSelect,
  CalendarYearSelect as SdkYearSelect,
} from "@ui-sdk/solid/calendar";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

const BaseCalendar: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "calendar",
  () => calendarStyles.root,
);
export function CalendarRoot(
  props: ComponentProps<typeof BaseCalendar> &
    YearPickerOptions & { selectionMode?: ComponentProps<typeof BaseCalendar>["mode"] },
) {
  const own = createCalendarController();
  const controller = () => props.controller ?? own;
  const rest = omit(
    props,
    "selectionMode",
    "isYearPickerOpen",
    "defaultYearPickerOpen",
    "onYearPickerOpenChange",
    "children",
  );
  return (
    <BaseCalendar {...rest} mode={props.mode ?? props.selectionMode} controller={controller()}>
      {!("children" in props)
        ? undefined
        : (state) => (
            <YearProvider
              state={state}
              controller={controller()}
              min={props.min}
              max={props.max}
              locale={props.locale}
              isYearPickerOpen={props.isYearPickerOpen}
              defaultYearPickerOpen={props.defaultYearPickerOpen}
              onYearPickerOpenChange={props.onYearPickerOpenChange}
            >
              {(() => {
                const child = props.children;
                return typeof child === "function" ? child(state) : child;
              })()}
            </YearProvider>
          )}
    </BaseCalendar>
  );
}
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
const BaseGrid: StyledPart<typeof SdkGrid> = sdkPart(
  SdkGrid,
  "calendar-grid",
  () => calendarStyles.nativeGrid,
);
export function CalendarGrid(props: ComponentProps<typeof BaseGrid>) {
  const picker = useContext(YearContext);
  return (
    <BaseGrid
      {...omit(props, "children")}
      aria-hidden={picker?.open() ? "true" : props["aria-hidden"]}
      inert={picker?.open() || props.inert}
      xstyle={[picker?.open() && calendarYearPickerStyles.dayGridHidden, props.xstyle]}
    >
      {"children" in props ? (
        props.children
      ) : (
        <>
          <CalendarWeekdays>{(index) => <CalendarWeekday index={index} />}</CalendarWeekdays>
          <CalendarWeeks>{(cell) => <CalendarDay value={cell.date} />}</CalendarWeeks>
        </>
      )}
    </BaseGrid>
  );
}
export const CalendarWeekdays: StyledPart<typeof SdkWeekdays> = sdkPart(
  SdkWeekdays,
  "calendar-weekdays",
  () => undefined,
);
export const CalendarWeekday: StyledPart<typeof SdkWeekday> = sdkPart(
  SdkWeekday,
  "calendar-weekday",
  () => calendarStyles.headerCell,
);
export const CalendarWeeks: StyledPart<typeof SdkWeeks> = sdkPart(
  SdkWeeks,
  "calendar-weeks",
  () => calendarStyles.dayBody,
);
export const CalendarDay: StyledPart<typeof SdkDay> = sdkPart(SdkDay, "calendar-day", () => [
  calendarStyles.cell,
  calendarStyles.nativeDay,
]);
export const CalendarMonthSelect: StyledPart<typeof SdkMonthSelect> = sdkPart(
  SdkMonthSelect,
  "calendar-month-select",
  () => calendarStyles.navButton,
);
export const CalendarYearSelect: StyledPart<typeof SdkYearSelect> = sdkPart(
  SdkYearSelect,
  "calendar-year-select",
  () => calendarStyles.navButton,
);

export { createCalendarController } from "@ui-sdk/solid/calendar";

const CalendarCellIndicatorBase = htmlPart("span", "calendar-cell-indicator", () => [
  calendarStyles.indicator,
  calendarStyles.nativeIndicator,
]);
export function CalendarCellIndicator(props: Parameters<typeof CalendarCellIndicatorBase>[0]) {
  return (
    <CalendarCellIndicatorBase aria-hidden="true" {...props}>
      {props.children ?? null}
    </CalendarCellIndicatorBase>
  );
}
export function CalendarNavButton(props: ComponentProps<typeof CalendarNext>) {
  return props.slot === "previous" ? <CalendarPrevious {...props} /> : <CalendarNext {...props} />;
}
export const Calendar: typeof CalendarRoot & {
  YearPickerTrigger: typeof Years.CalendarYearPickerTrigger;
  YearPickerTriggerHeading: typeof Years.CalendarYearPickerTriggerHeading;
  YearPickerTriggerIndicator: typeof Years.CalendarYearPickerTriggerIndicator;
  YearPickerGrid: typeof Years.CalendarYearPickerGrid;
  YearPickerGridBody: typeof Years.CalendarYearPickerGridBody;
  YearPickerCell: typeof Years.CalendarYearPickerCell;
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
  YearPickerTrigger: Years.CalendarYearPickerTrigger,
  YearPickerTriggerHeading: Years.CalendarYearPickerTriggerHeading,
  YearPickerTriggerIndicator: Years.CalendarYearPickerTriggerIndicator,
  YearPickerGrid: Years.CalendarYearPickerGrid,
  YearPickerGridBody: Years.CalendarYearPickerGridBody,
  YearPickerCell: Years.CalendarYearPickerCell,
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

export { YearPickerContext, useYearPicker, useCalendarOrRangeState } from "./year-picker.jsx";
