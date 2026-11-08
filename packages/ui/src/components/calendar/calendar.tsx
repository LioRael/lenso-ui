"use client";
// Modified: Base UI buttons/render contracts and internationalized calendar state.
import type * as React from "react";
import {
  createContext,
  use,
  useMemo,
  useEffect,
  useRef,
  useState,
  cloneElement,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { Button } from "@base-ui/react/button";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import {
  useCalendarState,
  type DateValue,
  type CalendarProps,
  type CalendarSelectionMode,
} from "react-stately/useCalendarState";
import {
  CalendarDate,
  DateFormatter,
  createCalendar,
  getLocalTimeZone,
  startOfWeek,
  endOfWeek,
  today,
  isSameDay,
  isSameMonth,
  type CalendarIdentifier,
  type DateDuration,
} from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { calendarStyles as styles } from "@lenso/tokens/calendar";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useLocale } from "../../utils/locale.js";
import { assignRef } from "../../utils/interaction/ref.js";
import {
  CalendarStateContext,
  calendarHeading,
  useNativeCalendarState,
  type NativeCalendarState,
  type CalendarHeadingFormat,
} from "../../utils/calendar-state.js";
import { PickerDateContext } from "../../utils/date-picker-state.js";
import { dateDOMProps } from "../../utils/date-field-state.js";
import {
  YearPickerProvider,
  useYearPicker,
  type YearPickerOptions,
} from "../calendar-year-picker/year-picker-context.js";
export const CalendarView = createContext<{
  days?: number;
  firstDayOfWeek?: CalendarProps<DateValue>["firstDayOfWeek"];
  weekdayStyle?: "narrow" | "short" | "long";
  start?: CalendarDate;
  autoFocus?: boolean;
}>({});
export function useCalendarBounds(minValue?: DateValue | null, maxValue?: DateValue | null) {
  const { locale } = useLocale();
  return useMemo(() => {
    const calendar = createCalendar(
      new DateFormatter(locale).resolvedOptions().calendar as CalendarIdentifier,
    );
    const offsets: Record<string, number> = {
      buddhist: 543,
      ethiopic: -8,
      ethioaa: -8,
      coptic: -284,
      hebrew: 3760,
      indian: -78,
      "islamic-civil": -579,
      "islamic-tbla": -579,
      "islamic-umalqura": -579,
      persian: -600,
    };
    const offset = offsets[calendar.identifier] ?? 0;
    return {
      minValue: minValue ?? new CalendarDate(calendar, 1900 + offset, 1, 1),
      maxValue: maxValue ?? new CalendarDate(calendar, 2099 + offset, 12, 31),
    };
  }, [locale, minValue, maxValue]);
}

export type CalendarRenderState = {
  isDisabled: boolean;
  isReadOnly: boolean;
  isInvalid: boolean;
  state: NativeCalendarState;
};
export type CalendarDOMProps = Omit<
  useRender.ComponentProps<"div", CalendarRenderState>,
  "children" | "style" | "onChange" | "defaultValue" | "onFocusChange"
> & {
  children?: ReactNode | ((state: CalendarRenderState) => ReactNode);
  style?: CSSProperties | ((state: CalendarRenderState) => CSSProperties | undefined);
  visibleDuration?: DateDuration;
};
export type CalendarRootProps<
  T extends DateValue = DateValue,
  M extends CalendarSelectionMode = "single",
> = StyleXProps<CalendarDOMProps> & CalendarProps<T, M> & YearPickerOptions;
export function CalendarRoot<
  T extends DateValue = DateValue,
  M extends CalendarSelectionMode = "single",
>({
  isYearPickerOpen,
  defaultYearPickerOpen,
  onYearPickerOpenChange,
  ...props
}: CalendarRootProps<T, M>) {
  return (
    <YearPickerProvider {...{ isYearPickerOpen, defaultYearPickerOpen, onYearPickerOpenChange }}>
      <CalendarInner {...props} />
    </YearPickerProvider>
  );
}
function CalendarInner<T extends DateValue, M extends CalendarSelectionMode>(
  props: StyleXProps<CalendarDOMProps> & CalendarProps<T, M>,
) {
  const { locale } = useLocale();
  const { calendarRef } = useYearPicker();
  const picker = use(PickerDateContext);
  const options = { ...picker?.calendarProps, ...props };
  const bounds = useCalendarBounds(options.minValue, options.maxValue);
  const inherit =
    props.value === undefined &&
    props.defaultValue === undefined &&
    picker &&
    props.selectionMode !== "multiple";
  const selection = props.value ?? props.defaultValue;
  const state = useCalendarState<DateValue, CalendarSelectionMode>({
    ...options,
    ...bounds,
    locale,
    createCalendar,
    value: inherit ? picker.model.dateValue : props.value,
    defaultFocusedValue:
      props.defaultFocusedValue ??
      (Array.isArray(selection) && selection.length === 0 ? today(getLocalTimeZone()) : undefined),
    onChange: (value) => {
      if (inherit && value && !Array.isArray(value)) picker.select(value as DateValue);
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
  const compiled = stylex.props(styles.root, xstyle);
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
      "data-slot": props["data-slot"] ?? "calendar",
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
export function calendarDOMProps(props: object) {
  const rest = dateDOMProps(props);
  for (const name of [
    "selectionMode",
    "visibleDuration",
    "selectionAlignment",
    "weeksInMonth",
    "errorMessage",
    "focusedValue",
    "defaultFocusedValue",
    "allowsNonContiguousRanges",
  ])
    delete rest[name];
  return rest;
}
export function CalendarHeader({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<"header">>) {
  const compiled = stylex.props(styles.header, xstyle);
  return (
    <header
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: unknown })["data-slot"] ?? "calendar-header"}
    />
  );
}

export function CalendarHeadingPart({
  offset,
  format,
  children,
  ref,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<useRender.ComponentProps<"h2">> & {
  offset?: DateDuration;
  format?: CalendarHeadingFormat;
}) {
  const state = useNativeCalendarState();
  const { locale } = useLocale();
  const compiled = stylex.props(styles.heading, xstyle);
  return useRender({
    defaultTagName: "h2",
    ref,
    render,
    props: mergeProps(compiled, props, {
      "data-slot": props["data-slot"] ?? "calendar-heading",
      style: mergeStyle(compiled.style, style),
      children: children ?? calendarHeading(state, locale, { offset, format }),
    }),
  });
}
export function CalendarNavButton({
  children,
  slot,
  xstyle,
  style,
  onClick,
  disabled,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Button>>) {
  const state = useNativeCalendarState();
  const { isYearPickerOpen } = useYearPicker();
  const { direction } = useLocale();
  const previous = slot === "previous";
  const compiled = stylex.props(styles.navButton, isYearPickerOpen && styles.navHidden, xstyle);
  return (
    <Button
      {...props}
      {...compiled}
      slot={slot ?? undefined}
      disabled={
        disabled ??
        (state.isDisabled ||
          (previous ? state.isPreviousVisibleRangeInvalid() : state.isNextVisibleRangeInvalid()))
      }
      aria-label={props["aria-label"] ?? (previous ? "Previous page" : "Next page")}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          state.setFocused(false);
          if (previous) state.focusPreviousPage();
          else state.focusNextPage();
        }
      }}
      data-slot={props["data-slot"] ?? "calendar-nav-button"}
      style={mergeStyle(compiled.style, style)}
    >
      {children ?? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          {...stylex.props(styles.navIcon, direction === "rtl" && styles.rtlIcon)}
        >
          <path d={previous ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
        </svg>
      )}
    </Button>
  );
}
export type CalendarGridProps = StyleXProps<Omit<useRender.ComponentProps<"table">, "children">> & {
  offset?: DateDuration;
  weekdayStyle?: "narrow" | "short" | "long";
  children?: ReactNode | ((date: CalendarDate) => ReactElement);
};
export function CalendarGrid({
  children,
  offset,
  weekdayStyle = "short",
  ref,
  render,
  xstyle,
  style,
  ...props
}: CalendarGridProps) {
  const parent = use(CalendarView);
  const state = useNativeCalendarState();
  const { locale } = useLocale();
  const { isYearPickerOpen, calendarGridSlot } = useYearPicker();
  const start = offset ? state.visibleRange.start.add(offset) : state.visibleRange.start;
  const compiled = stylex.props(
    styles.grid,
    parent.days != null && styles.dayGrid,
    isYearPickerOpen && styles.gridHidden,
    xstyle,
  );
  const element = useRender({
    defaultTagName: "table",
    ref,
    render,
    props: mergeProps(compiled, props, {
      role: "grid",
      "aria-label": props["aria-label"] ?? calendarHeading(state, locale, { offset }),
      "aria-readonly": state.isReadOnly || undefined,
      "aria-multiselectable":
        "anchorDate" in state || state.selectionMode === "multiple" || undefined,
      "aria-hidden": isYearPickerOpen || undefined,
      "data-slot": props["data-slot"] ?? calendarGridSlot,
      style: mergeStyle(compiled.style, style),
      children:
        typeof children === "function" ? (
          <>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCellPart>{day}</CalendarHeaderCellPart>}
            </CalendarGridHeader>
            <CalendarGridBody>{children}</CalendarGridBody>
          </>
        ) : (
          children
        ),
    }),
  });
  return <CalendarView value={{ ...parent, start, weekdayStyle }}>{element}</CalendarView>;
}
export function CalendarGridHeader({
  children,
  render,
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<useRender.ComponentProps<"thead">, "children">> & {
  children?: ReactNode | ((day: string) => ReactElement);
}) {
  const view = use(CalendarView);
  const state = useNativeCalendarState();
  const { locale } = useLocale();
  const start = startOfWeek(view.start ?? state.visibleRange.start, locale, view.firstDayOfWeek);
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: view.weekdayStyle ?? "short",
    timeZone: state.timeZone,
  });
  const compiled = stylex.props(styles.section, view.days != null && styles.daySection, xstyle);
  return useRender({
    defaultTagName: "thead",
    render,
    ref,
    props: mergeProps(compiled, props, {
      "data-slot": props["data-slot"] ?? "calendar-grid-header",
      "aria-hidden": true,
      style: mergeStyle(compiled.style, style),
      children:
        typeof children === "function" ? (
          <tr {...stylex.props(styles.row)}>
            {Array.from({ length: 7 }, (_, index) =>
              cloneElement(
                children(formatter.format(start.add({ days: index }).toDate(state.timeZone))),
                { key: index },
              ),
            )}
          </tr>
        ) : (
          children
        ),
    }),
  });
}
export function CalendarGridBody({
  children,
  render,
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<useRender.ComponentProps<"tbody">, "children">> & {
  children?: ReactNode | ((date: CalendarDate) => ReactElement);
}) {
  const view = use(CalendarView);
  const state = useNativeCalendarState();
  const { locale } = useLocale();
  const start = view.start ?? state.visibleRange.start;
  const compiled = stylex.props(
    styles.section,
    view.days != null && styles.daySection,
    view.days != null && styles.dayBody,
    xstyle,
  );
  const rows: ReactNode[] = [];
  if (typeof children === "function") {
    const weekCount =
      view.days != null
        ? Math.ceil(
            (state.visibleRange.end.compare(startOfWeek(start, locale, view.firstDayOfWeek)) + 1) /
              7,
          )
        : state.getWeeksInMonth(start);
    for (let week = 0; week < weekCount; week++)
      rows.push(
        <tr key={week} {...stylex.props(styles.row)}>
          {state
            .getDatesInWeek(week, start)
            .map((date, index) =>
              date && (view.days == null || date.compare(state.visibleRange.end) <= 0) ? (
                cloneElement(children(date), { key: date.toString() })
              ) : (
                <td key={index} aria-hidden="true" />
              ),
            )}
        </tr>,
      );
  }
  return useRender({
    defaultTagName: "tbody",
    render,
    ref,
    props: mergeProps(compiled, props, {
      "data-slot": props["data-slot"] ?? "calendar-grid-body",
      style: mergeStyle(compiled.style, style),
      children: typeof children === "function" ? rows : children,
    }),
  });
}
export function CalendarHeaderCellPart({
  render,
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<useRender.ComponentProps<"th">>) {
  const compiled = stylex.props(styles.headerCell, xstyle);
  return useRender({
    defaultTagName: "th",
    render,
    ref,
    props: mergeProps(compiled, props, {
      scope: "col",
      "data-slot": props["data-slot"] ?? "calendar-header-cell",
      style: mergeStyle(compiled.style, style),
    }),
  });
}
export function useCalendarGestures(state: NativeCalendarState) {
  const drag = useRef<{ start: CalendarDate; id: number; anchor: CalendarDate | null } | null>(
    null,
  );
  const skipClick = useRef(0);
  useEffect(() => {
    if (!("anchorDate" in state)) return;
    const up = (event: globalThis.PointerEvent) => {
      if (drag.current?.id !== event.pointerId) return;
      if (state.isDragging && state.anchorDate) {
        state.commitSelection();
        skipClick.current = performance.now() + 500;
      }
      drag.current = null;
      state.setDragging(false);
    };
    const cancel = () => {
      if (!drag.current) return;
      state.setAnchorDate(drag.current.anchor);
      drag.current = null;
      state.setDragging(false);
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel);
    };
  }, [state]);
  return {
    begin(date: CalendarDate, event: PointerEvent<HTMLElement>) {
      if (
        "anchorDate" in state &&
        !state.isDisabled &&
        !state.isReadOnly &&
        event.pointerType === "mouse" &&
        event.button === 0
      )
        drag.current = { start: date, id: event.pointerId, anchor: state.anchorDate };
    },
    hover(date: CalendarDate) {
      if (!("anchorDate" in state) || state.isCellUnavailable(date) || state.isCellDisabled(date))
        return;
      if (drag.current && !isSameDay(drag.current.start, date)) {
        if (!state.anchorDate) state.setAnchorDate(drag.current.start);
        state.setDragging(true);
      }
      state.highlightDate(date);
    },
    consume(detail: number) {
      if (detail > 0 && performance.now() < skipClick.current) {
        skipClick.current = 0;
        return true;
      }
      return false;
    },
  };
}
export const CalendarGestures = createContext<ReturnType<typeof useCalendarGestures> | null>(null);
export function useNativeCalendarCell(date: CalendarDate) {
  const state = useNativeCalendarState();
  const view = use(CalendarView);
  const { locale, direction } = useLocale();
  const { calendarRef } = useYearPicker();
  const gestures = use(CalendarGestures);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);
  const calendar = date.calendar.identifier;
  const timeZone = state.timeZone;
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", calendar, timeZone }),
    [locale, calendar, timeZone],
  );
  const labelFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        calendar,
        timeZone,
      }),
    [locale, calendar, timeZone],
  );
  const selected = state.isSelected(date);
  const outside = view.days == null && !isSameMonth(date, view.start ?? state.visibleRange.start);
  const disabled = state.isCellDisabled(date);
  const unavailable = state.isCellUnavailable(date);
  const range = "anchorDate" in state ? state.highlightedRange : null;
  const values = {
    date,
    isToday: isSameDay(date, today(state.timeZone)),
    isSelected: selected,
    isSelectionStart: !!range && isSameDay(date, range.start),
    isSelectionEnd: !!range && isSameDay(date, range.end),
    isHovered: hovered,
    isPressed: pressed,
    isFocusVisible: focusVisible,
    isOutsideMonth: outside,
    isDisabled: disabled,
    isUnavailable: unavailable,
    isInvalid: state.isInvalid(date),
    formattedDate:
      dayFormatter.formatToParts(date.toDate(state.timeZone)).find((part) => part.type === "day")
        ?.value ?? String(date.day),
  };
  const navigate = (event: KeyboardEvent<HTMLButtonElement>) => {
    const action = {
      ArrowRight: direction === "rtl" ? state.focusPreviousDay : state.focusNextDay,
      ArrowLeft: direction === "rtl" ? state.focusNextDay : state.focusPreviousDay,
      ArrowUp: state.focusPreviousRow,
      ArrowDown: state.focusNextRow,
      PageUp: () => state.focusPreviousSection(event.shiftKey),
      PageDown: () => state.focusNextSection(event.shiftKey),
      Home: () => state.setFocusedDate(startOfWeek(state.focusedDate, locale, view.firstDayOfWeek)),
      End: () => state.setFocusedDate(endOfWeek(state.focusedDate, locale, view.firstDayOfWeek)),
    }[event.key];
    if (!action) return;
    event.preventDefault();
    action();
    const steps = {
      ArrowRight: direction === "rtl" ? -1 : 1,
      ArrowLeft: direction === "rtl" ? 1 : -1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const days = steps[event.key as keyof typeof steps];
    const target = days === undefined ? null : date.add({ days });
    const existing = target
      ? calendarRef.current?.querySelector<HTMLElement>(
          `[data-calendar-date="${target.toString()}"]:not([data-outside-month])`,
        )
      : null;
    if (existing) existing.focus();
    else
      requestAnimationFrame(() =>
        calendarRef.current?.querySelector<HTMLElement>('[data-calendar-focused="true"]')?.focus(),
      );
  };
  const fullDate = labelFormatter.format(date.toDate(state.timeZone));
  return {
    values,
    native: {
      disabled: disabled || unavailable,
      tabIndex: isSameDay(date, state.focusedDate) && !outside ? 0 : -1,
      autoFocus: view.autoFocus && isSameDay(date, state.focusedDate) && !outside,
      "aria-label": `${fullDate}${selected ? " selected" : ""}`,
      "aria-pressed": selected,
      "data-calendar-date": date.toString(),
      "data-calendar-focused": (isSameDay(date, state.focusedDate) && !outside) || undefined,
      "data-outside-month": outside || undefined,
      onFocus(event: React.FocusEvent<HTMLButtonElement>) {
        state.setFocusedDate(date);
        state.setFocused(true);
        setFocusVisible(event.currentTarget.matches(":focus-visible"));
      },
      onBlur() {
        setFocusVisible(false);
        setPressed(false);
      },
      onKeyDown: navigate,
      onPointerDown(event: PointerEvent<HTMLButtonElement>) {
        setPressed(true);
        gestures?.begin(date, event);
      },
      onPointerUp() {
        setPressed(false);
      },
      onPointerCancel() {
        setPressed(false);
      },
      onPointerEnter() {
        setHovered(true);
        gestures?.hover(date);
      },
      onPointerLeave() {
        setHovered(false);
        setPressed(false);
      },
      onClick(event: React.MouseEvent<HTMLButtonElement>) {
        if (!gestures?.consume(event.detail) && !disabled && !unavailable) state.selectDate(date);
      },
    },
  };
}
export const CalendarCellSelection = createContext(false);
export type CalendarCellRenderState = ReturnType<typeof useNativeCalendarCell>["values"];
export type CalendarCellProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof Button>, "children" | "style">
> & {
  date: CalendarDate;
  children?: ReactNode | ((state: CalendarCellRenderState) => ReactNode);
  style?: CSSProperties | ((state: CalendarCellRenderState) => CSSProperties | undefined);
};
export function CalendarCell({ date, children, xstyle, style, ...props }: CalendarCellProps) {
  const { values, native } = useNativeCalendarCell(date);
  const compiled = stylex.props(
    styles.cell,
    styles.cellButton,
    values.isToday && styles.today,
    values.isSelected && styles.selected,
    values.isOutsideMonth && styles.outside,
    values.isDisabled && styles.disabled,
    values.isUnavailable && styles.unavailable,
    xstyle,
  );
  return (
    <td {...stylex.props(styles.cellContainer)} aria-selected={values.isSelected}>
      <Button
        {...mergeProps(native, props, compiled)}
        data-slot={props["data-slot"] ?? "calendar-cell"}
        style={{ ...compiled.style, ...(typeof style === "function" ? style(values) : style) }}
      >
        <CalendarCellSelection value={values.isSelected}>
          {typeof children === "function" ? children(values) : (children ?? values.formattedDate)}
        </CalendarCellSelection>
      </Button>
    </td>
  );
}
export function CalendarCellIndicator({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<"span">>) {
  const selected = use(CalendarCellSelection);
  const compiled = stylex.props(styles.indicator, selected && styles.selectedIndicator, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: unknown })["data-slot"] ?? "calendar-cell-indicator"}
      aria-hidden="true"
    />
  );
}
