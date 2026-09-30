"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import {
  RangeCalendar as Primitive,
  type RangeCalendarProps,
  CalendarCell as Cell,
} from "react-aria-components/RangeCalendar";
import type { DateValue } from "react-aria-components/Calendar";
import type { ComponentPropsWithRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { rangeCalendarStyles } from "@lenso/tokens/range-calendar";
import { calendarStyles as styles } from "@lenso/tokens/calendar";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { racPart } from "../date-input-group/rac-part.js";
import {
  YearPickerProvider,
  useYearPicker,
  type YearPickerOptions,
} from "../calendar-year-picker/year-picker-context.js";
import {
  CalendarView,
  useCalendarBounds,
  CalendarHeader,
  CalendarHeadingPart,
  CalendarNavButton,
  CalendarGrid,
  CalendarGridHeader,
  CalendarGridBody,
  CalendarHeaderCellPart,
  CalendarCellIndicator,
  CalendarCellSelection,
} from "../calendar/calendar.js";
export type RangeCalendarRootProps<T extends DateValue = DateValue> = StyleXProps<
  RangeCalendarProps<T>
> &
  YearPickerOptions;
export function RangeCalendarRoot<T extends DateValue>({
  isYearPickerOpen,
  defaultYearPickerOpen,
  onYearPickerOpenChange,
  ...props
}: RangeCalendarRootProps<T>) {
  return (
    <YearPickerProvider
      range
      {...{ isYearPickerOpen, defaultYearPickerOpen, onYearPickerOpenChange }}
    >
      <Inner {...props} />
    </YearPickerProvider>
  );
}
function Inner<T extends DateValue>({
  xstyle,
  style,
  minValue,
  maxValue,
  ...props
}: StyleXProps<RangeCalendarProps<T>>) {
  const { calendarRef } = useYearPicker();
  const bounds = useCalendarBounds(minValue, maxValue);
  const compiled = stylex.props(rangeCalendarStyles.root, xstyle);
  return (
    <CalendarView
      value={{ days: props.visibleDuration?.days, firstDayOfWeek: props.firstDayOfWeek }}
    >
      <Primitive<T>
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        minValue={bounds.minValue as T}
        maxValue={bounds.maxValue as T}
        ref={calendarRef}
        data-slot="range-calendar"
      />
    </CalendarView>
  );
}
export {
  CalendarHeader as RangeCalendarHeader,
  CalendarHeadingPart as RangeCalendarHeading,
  CalendarNavButton as RangeCalendarNavButton,
  CalendarGrid as RangeCalendarGrid,
  CalendarGridHeader as RangeCalendarGridHeader,
  CalendarGridBody as RangeCalendarGridBody,
  CalendarHeaderCellPart as RangeCalendarHeaderCell,
  CalendarCellIndicator as RangeCalendarCellIndicator,
};
const RangeCell = racPart(
  Cell,
  "range-calendar-cell",
  (state: {
    isToday: boolean;
    isSelected: boolean;
    isSelectionStart: boolean;
    isSelectionEnd: boolean;
    isHovered: boolean;
    isFocusVisible: boolean;
    isOutsideMonth: boolean;
    isDisabled: boolean;
    isUnavailable: boolean;
  }) => [
    rangeCalendarStyles.cell,
    state.isSelected && !state.isOutsideMonth && styles.range,
    state.isSelected && !state.isOutsideMonth && rangeCalendarStyles.rowEdges,
    state.isSelectionStart && styles.rangeStart,
    state.isSelectionEnd && styles.rangeEnd,
    (state.isSelectionStart || state.isSelectionEnd || state.isFocusVisible) &&
      rangeCalendarStyles.raised,
    state.isOutsideMonth && styles.outside,
    (state.isDisabled || state.isUnavailable) && styles.unavailable,
  ],
);
export type RangeCalendarCellProps = StyleXProps<ComponentPropsWithRef<typeof Cell>> & {
  buttonXstyle?: stylex.StyleXStyles;
};
export function RangeCalendarCell({ children, buttonXstyle, ...props }: RangeCalendarCellProps) {
  return (
    <RangeCell {...props}>
      {(state) => (
        <CalendarCellSelection value={state.isSelected}>
          <span
            data-slot="range-calendar-cell-button"
            {...stylex.props(
              rangeCalendarStyles.cellButton,
              state.isToday && styles.today,
              state.isHovered && !state.isSelected && styles.hovered,
              (state.isSelectionStart || state.isSelectionEnd) &&
                !state.isOutsideMonth &&
                styles.selected,
              state.isFocusVisible && styles.focused,
              state.isPressed && rangeCalendarStyles.pressed,
              buttonXstyle,
            )}
          >
            {typeof children === "function" ? children(state) : (children ?? state.formattedDate)}
          </span>
        </CalendarCellSelection>
      )}
    </RangeCell>
  );
}
