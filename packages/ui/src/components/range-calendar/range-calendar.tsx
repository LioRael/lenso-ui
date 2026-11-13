"use client";
// Modified: UI SDK button/render contracts and internationalized range state.
import { use, useCallback } from "react";
import { NativeButton as Button } from "../../utils/native-button.js";
import { usePart, renderElement } from "@ui-sdk/react/primitive";
import { mergeProps } from "@ui-sdk/react/primitive";
import {
  useRangeCalendarState,
  type RangeCalendarProps,
  type DateValue,
} from "react-stately/useRangeCalendarState";
import { createCalendar } from "@internationalized/date";
import { rangeCalendar as rangeCalendarPrimitive } from "@lenso/primitives/model-control";
import { useModelControl, type ModelValueOptions } from "../../utils/model-control.js";
import { encodeRange, decodeRange, type DateRangeValue } from "../../utils/date-values.js";
import { moveCalendarFocus } from "../../utils/calendar-control.js";
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
  CalendarControlContext,
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
  StyleXProps<CalendarDOMProps> &
    RangeCalendarProps<T> &
    Pick<ModelValueOptions<{ start: T; end: T }>, "onValueChange" | "controller"> &
    YearPickerOptions;
export function RangeCalendarRoot<T extends DateValue = DateValue>({
  isYearPickerOpen,
  defaultYearPickerOpen,
  onYearPickerOpenChange,
  ...props
}: RangeCalendarRootProps<T>) {
  const picker = use(PickerRangeContext);
  return (
    <YearPickerProvider
      range
      disabled={props.isDisabled ?? picker?.calendarProps.isDisabled}
      label={props["aria-label"]}
      {...{ isYearPickerOpen, defaultYearPickerOpen, onYearPickerOpenChange }}
    >
      <Inner {...props} />
    </YearPickerProvider>
  );
}
function Inner<T extends DateValue>(
  props: Omit<
    RangeCalendarRootProps<T>,
    "isYearPickerOpen" | "defaultYearPickerOpen" | "onYearPickerOpenChange"
  >,
) {
  const { locale } = useLocale();
  const { calendarRef } = useYearPicker();
  const picker = use(PickerRangeContext);
  const options = { ...picker?.calendarProps, ...props };
  const bounds = useCalendarBounds(options.minValue, options.maxValue);
  const inherit = props.value === undefined && props.defaultValue === undefined && picker;
  const range = picker?.model.dateRange;
  const pickerValue = range?.start && range.end ? { start: range.start, end: range.end } : null;
  const control = useModelControl<DateRangeValue>(
    rangeCalendarPrimitive,
    {
      ...options,
      value: inherit ? pickerValue : props.value,
      onValueChange(value, details) {
        props.onValueChange?.(value as { start: T; end: T } | null, details);
        if (!details.canceled && inherit && picker.select(value, details) === false)
          details.cancel();
        if (!details.canceled)
          props.onChange?.(value as Parameters<NonNullable<typeof props.onChange>>[0]);
      },
      onChange: undefined,
    },
    encodeRange,
    useCallback(
      (value) => decodeRange(value, props.value ?? props.defaultValue),
      [props.value, props.defaultValue],
    ),
    { move: (event, from) => moveCalendarFocus(event, from, state, locale, props.firstDayOfWeek) },
  );
  const state: ReturnType<typeof useRangeCalendarState<DateValue>> =
    useRangeCalendarState<DateValue>({
      ...options,
      ...bounds,
      locale,
      createCalendar,
      value: control.value,
      defaultValue: undefined,
      onChange: control.change,
    });
  const gestures = useCalendarGestures(state, control.handle);
  const { xstyle, style, render, ref, children } = props;
  const presentation: CalendarRenderState = {
    isDisabled: state.isDisabled,
    isReadOnly: state.isReadOnly,
    isInvalid: state.isValueInvalid,
    state,
  };
  const compiled = stylex.props(rangeCalendarStyles.root, xstyle);
  const element = usePart(
    control.handle,
    "root",
    {},
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs without reading them during render.
    {
      ...mergeProps(compiled, calendarDOMProps(props), {
        role: props.role ?? "group",
        "data-lenso-slot": props["data-lenso-slot"] ?? "range-calendar",
        "data-disabled": state.isDisabled || undefined,
        style:
          typeof style === "function"
            ? { ...compiled.style, ...style(presentation) }
            : mergeStyle(compiled.style, style),
        children: typeof children === "function" ? children(presentation) : children,
      }),
      render: (node) => renderElement("div", node, render, presentation),
      ref: (node: React.ComponentRef<"div"> | null) => {
        const caller = assignRef(ref, node);
        const own = assignRef(calendarRef, node);
        return () => {
          caller();
          own();
        };
      },
    },
    "div",
  );
  return (
    <CalendarControlContext value={control.handle}>
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
    </CalendarControlContext>
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
  onClick,
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
        onClick={(event, details) => {
          const result = onClick?.(event, details);
          if (!event.defaultPrevented) native.onClick(event, details);
          return result;
        }}
        data-lenso-slot={props["data-lenso-slot"] ?? "range-calendar-cell"}
        style={{ ...compiled.style, ...(typeof style === "function" ? style(state) : style) }}
      >
        <CalendarCellSelection value={state.isSelected}>
          <span
            data-lenso-slot="range-calendar-cell-button"
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
