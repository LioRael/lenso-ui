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

export const CalendarRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "calendar",
  () => calendarStyles.root,
);
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
export const CalendarGrid: StyledPart<typeof SdkGrid> = sdkPart(
  SdkGrid,
  "calendar-grid",
  () => calendarStyles.grid,
);
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
export const CalendarDay: StyledPart<typeof SdkDay> = sdkPart(
  SdkDay,
  "calendar-day",
  () => calendarStyles.cell,
);
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

export const Calendar: typeof CalendarRoot & {
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
