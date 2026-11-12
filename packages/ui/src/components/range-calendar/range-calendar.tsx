"use client";
// Modified: Base UI button/render contracts and internationalized range state.
import { use } from "react";
import { NativeButton as Button } from "../../utils/native-button.js";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import {
  useRangeCalendarState,
  type RangeCalendarProps,
  type DateValue,
} from "react-stately/useRangeCalendarState";
import { createCalendar } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { rangeCalendarStyles } from "@lenso/tokens/range-calendar";
import { calendarStyles as styles } from "@lenso/tokens/calendar";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useLocale } from "../../utils/locale.js";
import { assignRef } from "../../utils/interaction/ref.js";
import { CalendarStateContext } from "../../utils/calendar-state.js";
import { PickerRangeContext } from "../../utils/date-picker-state.js";
import {
  YearPickerProvider,
  useYearPicker,
  type YearPickerOptions,
} from "../calendar-year-picker/year-picker-context.js";
import {
  CalendarView,
  CalendarGestures,
  useCalendarGestures,
  useCalendarBounds,
  calendarDOMProps,
  useNativeCalendarCell,
  type CalendarCellProps,
  type CalendarDOMProps,
  type CalendarRenderState,
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
export type RangeCalendarRootProps<T extends DateValue = DateValue> =
  StyleXProps<CalendarDOMProps> & RangeCalendarProps<T> & YearPickerOptions;
export function RangeCalendarRoot<T extends DateValue = DateValue>({
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
function Inner<T extends DateValue>(props: StyleXProps<CalendarDOMProps> & RangeCalendarProps<T>) {
  const { locale } = useLocale();
  const { calendarRef } = useYearPicker();
  const picker = use(PickerRangeContext);
  const options = { ...picker?.calendarProps, ...props };
  const bounds = useCalendarBounds(options.minValue, options.maxValue);
  const inherit = props.value === undefined && props.defaultValue === undefined && picker;
  const range = picker?.model.dateRange;
  const pickerValue = range?.start && range.end ? { start: range.start, end: range.end } : null;
  const state = useRangeCalendarState<DateValue>({
    ...options,
    ...bounds,
    locale,
    createCalendar,
    value: inherit ? pickerValue : props.value,
    onChange: (value) => {
      if (inherit) picker.select(value);
      props.onChange?.(value as Parameters<NonNullable<typeof props.onChange>>[0]);
    },
  });
  const gestures = useCalendarGestures(state);
  const { xstyle, style, render, ref, children } = props;
  const presentation: CalendarRenderState = {
    isDisabled: state.isDisabled,
    isReadOnly: state.isReadOnly,
    isInvalid: state.isValueInvalid,
    state,
  };
  const compiled = stylex.props(rangeCalendarStyles.root, xstyle);
  const element = useRender({
    defaultTagName: "div",
    render,
    ref: (node) => {
      const caller = assignRef(ref, node);
      const own = assignRef(calendarRef, node);
      return () => {
        caller();
        own();
      };
    },
    state: presentation,
    stateAttributesMapping: { state: () => null },
    props: mergeProps(compiled, calendarDOMProps(props), {
      role: props.role ?? "group",
      "data-slot": props["data-slot"] ?? "range-calendar",
      "data-disabled": state.isDisabled || undefined,
      style:
        typeof style === "function"
          ? { ...compiled.style, ...style(presentation) }
          : mergeStyle(compiled.style, style),
      children: typeof children === "function" ? children(presentation) : children,
    }),
  });
  return (
    <CalendarStateContext value={state}>
      <CalendarGestures value={gestures}>
        <CalendarView
          value={{
            days:
              props.visibleDuration?.days ??
              (props.visibleDuration?.weeks ? props.visibleDuration.weeks * 7 : undefined),
            firstDayOfWeek: props.firstDayOfWeek,
            autoFocus: props.autoFocus,
          }}
        >
          {element}
        </CalendarView>
      </CalendarGestures>
    </CalendarStateContext>
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
export type RangeCalendarCellProps = CalendarCellProps & { buttonXstyle?: stylex.StyleXStyles };
export function RangeCalendarCell({
  date,
  children,
  buttonXstyle,
  xstyle,
  style,
  ...props
}: RangeCalendarCellProps) {
  const { values: state, native } = useNativeCalendarCell(date);
  const compiled = stylex.props(
    styles.cell,
    styles.cellButton,
    rangeCalendarStyles.cell,
    state.isSelected && !state.isOutsideMonth && styles.range,
    state.isSelected && !state.isOutsideMonth && rangeCalendarStyles.rowEdges,
    state.isSelectionStart && styles.rangeStart,
    state.isSelectionEnd && styles.rangeEnd,
    (state.isSelectionStart || state.isSelectionEnd || state.isFocusVisible) &&
      rangeCalendarStyles.raised,
    state.isOutsideMonth && styles.outside,
    state.isDisabled && styles.disabled,
    state.isUnavailable && styles.unavailable,
    xstyle,
  );
  return (
    <td {...stylex.props(styles.cellContainer)} aria-selected={state.isSelected}>
      <Button
        {...mergeProps(native, props, compiled)}
        data-slot={props["data-slot"] ?? "range-calendar-cell"}
        style={{ ...compiled.style, ...(typeof style === "function" ? style(state) : style) }}
      >
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
      </Button>
    </td>
  );
}
