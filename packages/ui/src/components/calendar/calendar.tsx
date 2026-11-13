"use client";
// Modified: UI SDK buttons/render contracts and internationalized calendar state.
import type * as React from "react";
import type { ButtonActionDetails } from "@ui-sdk/react/button";
import { withSource } from "@ui-sdk/core/observe";
import {
  createContext,
  useCallback,
  use,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  cloneElement,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { NativeButton as Button } from "../../utils/native-button.js";
import { usePart, renderElement, type PartProps } from "@ui-sdk/react/primitive";
import { mergeProps } from "@ui-sdk/react/primitive";
import {
  useCalendarState,
  type DateValue,
  type CalendarProps,
  type CalendarSelectionMode,
} from "react-stately/useCalendarState";
import {
  CalendarDate,
  toCalendarDate,
  DateFormatter,
  createCalendar,
  getLocalTimeZone,
  today,
  isSameDay,
  isSameMonth,
  startOfWeek,
  type CalendarIdentifier,
  type DateDuration,
} from "@internationalized/date";
import { bindDrag, dragThreshold } from "@ui-sdk/core";
import { calendar as calendarPrimitive } from "@lenso/primitives/model-control";
import {
  useModelControl,
  type ModelValueOptions,
  type ModelControlHandle,
} from "../../utils/model-control.js";
import { encodeDate, decodeDate } from "../../utils/date-values.js";
import { moveCalendarFocus } from "../../utils/calendar-control.js";
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
export const CalendarControlContext = createContext<ModelControlHandle | null>(null);
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
  PartProps<"div", CalendarRenderState>,
  "children" | "style" | "onChange" | "defaultValue" | "onFocusChange"
> & {
  children?: ReactNode | ((state: CalendarRenderState) => ReactNode);
  style?: CSSProperties | ((state: CalendarRenderState) => CSSProperties | undefined);
  visibleDuration?: DateDuration;
};
type CalendarControlOptions<T extends DateValue, M extends CalendarSelectionMode> = Pick<
  ModelValueOptions<Exclude<CalendarProps<T, M>["value"], undefined | null>>,
  "onValueChange" | "controller"
>;
export type CalendarRootProps<
  T extends DateValue = DateValue,
  M extends CalendarSelectionMode = "single",
> = StyleXProps<CalendarDOMProps> &
  CalendarProps<T, M> &
  CalendarControlOptions<T, M> &
  YearPickerOptions;
export function CalendarRoot<
  T extends DateValue = DateValue,
  M extends CalendarSelectionMode = "single",
>({
  isYearPickerOpen,
  defaultYearPickerOpen,
  onYearPickerOpenChange,
  ...props
}: CalendarRootProps<T, M>) {
  const picker = use(PickerDateContext);
  return (
    <YearPickerProvider
      disabled={props.isDisabled ?? picker?.calendarProps.isDisabled}
      label={props["aria-label"]}
      {...{ isYearPickerOpen, defaultYearPickerOpen, onYearPickerOpenChange }}
    >
      <CalendarInner {...props} />
    </YearPickerProvider>
  );
}
function CalendarInner<T extends DateValue, M extends CalendarSelectionMode>(
  props: StyleXProps<CalendarDOMProps> & CalendarProps<T, M> & CalendarControlOptions<T, M>,
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
  const control = useModelControl<DateValue | readonly DateValue[]>(
    calendarPrimitive,
    {
      ...options,
      value: inherit
        ? picker.model.dateValue
        : Array.isArray(props.value)
          ? props.value.filter((date): date is T => date !== null)
          : (props.value as DateValue | null),
      defaultValue: Array.isArray(props.defaultValue)
        ? props.defaultValue.filter((date): date is T => date !== null)
        : (props.defaultValue as DateValue | null),
      onValueChange(value, details) {
        props.onValueChange?.(
          value as Parameters<NonNullable<CalendarControlOptions<T, M>["onValueChange"]>>[0],
          details,
        );
        if (!details.canceled && inherit && (value === null || "calendar" in value)) {
          if (picker.select(value, details) === false) details.cancel();
        }
        if (!details.canceled)
          props.onChange?.(value as Parameters<NonNullable<typeof props.onChange>>[0]);
      },
      onChange: undefined,
    },
    (value) =>
      value === null
        ? null
        : "calendar" in value
          ? encodeDate(value)
          : value.map((date) => date.toString()),
    useCallback(
      (value) =>
        Array.isArray(value)
          ? value.map((date) => decodeDate(date, props.defaultFocusedValue)!)
          : decodeDate(value, props.defaultFocusedValue),
      [props.defaultFocusedValue],
    ),
    { move: (event, from) => moveCalendarFocus(event, from, state, locale, props.firstDayOfWeek) },
  );
  const state: ReturnType<typeof useCalendarState<DateValue, CalendarSelectionMode>> =
    useCalendarState<DateValue, CalendarSelectionMode>({
      ...options,
      ...bounds,
      locale,
      createCalendar,
      value: control.value,
      defaultValue: undefined,
      defaultFocusedValue:
        props.defaultFocusedValue ??
        (Array.isArray(selection) && selection.length === 0
          ? today(getLocalTimeZone())
          : undefined),
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
  const compiled = stylex.props(styles.root, xstyle);
  const element = usePart(
    control.handle,
    "root",
    {},
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs without reading them during render.
    {
      ...mergeProps(compiled, calendarDOMProps(props), {
        role: props.role ?? "group",
        "data-lenso-slot": props["data-lenso-slot"] ?? "calendar",
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: unknown })["data-lenso-slot"] ?? "calendar-header"
      }
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
}: StyleXProps<PartProps<"h2">> & {
  offset?: DateDuration;
  format?: CalendarHeadingFormat;
}) {
  const state = useNativeCalendarState();
  const { locale } = useLocale();
  const compiled = stylex.props(styles.heading, xstyle);
  return renderElement(
    "h2",
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs without reading them during render.
    {
      ...mergeProps(compiled, props, {
        "data-lenso-slot": props["data-lenso-slot"] ?? "calendar-heading",
        style: mergeStyle(compiled.style, style),
        children: children ?? calendarHeading(state, locale, { offset, format }),
      }),
      ref: ref,
    },
    render,
  );
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
      onClick={(event, details) => {
        const result = onClick?.(event, details);
        if (!event.defaultPrevented) {
          state.setFocused(false);
          if (previous) state.focusPreviousPage();
          else state.focusNextPage();
        }
        return result;
      }}
      data-lenso-slot={props["data-lenso-slot"] ?? "calendar-nav-button"}
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
export type CalendarGridProps = StyleXProps<Omit<PartProps<"table">, "children">> & {
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
  const element = renderElement(
    "table",
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs without reading them during render.
    {
      ...mergeProps(compiled, props, {
        role: "grid",
        "aria-label": props["aria-label"] ?? calendarHeading(state, locale, { offset }),
        "aria-readonly": state.isReadOnly || undefined,
        "aria-multiselectable":
          "anchorDate" in state || state.selectionMode === "multiple" || undefined,
        "aria-hidden": isYearPickerOpen || undefined,
        "data-lenso-slot": props["data-lenso-slot"] ?? calendarGridSlot,
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
      ref: ref,
    },
    render,
  );
  return <CalendarView value={{ ...parent, start, weekdayStyle }}>{element}</CalendarView>;
}
export function CalendarGridHeader({
  children,
  render,
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<PartProps<"thead">, "children">> & {
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
  return renderElement(
    "thead",
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs without reading them during render.
    {
      ...mergeProps(compiled, props, {
        "data-lenso-slot": props["data-lenso-slot"] ?? "calendar-grid-header",
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
      ref: ref,
    },
    render,
  );
}
export function CalendarGridBody({
  children,
  render,
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<PartProps<"tbody">, "children">> & {
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
  return renderElement(
    "tbody",
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs without reading them during render.
    {
      ...mergeProps(compiled, props, {
        "data-lenso-slot": props["data-lenso-slot"] ?? "calendar-grid-body",
        style: mergeStyle(compiled.style, style),
        children: typeof children === "function" ? rows : children,
      }),
      ref: ref,
    },
    render,
  );
}
export function CalendarHeaderCellPart({
  render,
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<PartProps<"th">>) {
  const compiled = stylex.props(styles.headerCell, xstyle);
  return renderElement(
    "th",
    {
      ...mergeProps(compiled, props, {
        scope: "col",
        "data-lenso-slot": props["data-lenso-slot"] ?? "calendar-header-cell",
        style: mergeStyle(compiled.style, style),
      }),
      ref: ref,
    },
    render,
  );
}
export function useCalendarGestures(state: NativeCalendarState, control: ModelControlHandle) {
  const latest = useRef({ state, control });
  const release = useRef<(() => void) | undefined>(undefined);
  const finish = useRef(0);
  useLayoutEffect(() => {
    latest.current = { state, control };
  }, [state, control]);
  useEffect(
    () => () => {
      release.current?.();
      cancelAnimationFrame(finish.current);
    },
    [],
  );
  useEffect(() => {
    if (state.isDisabled || state.isReadOnly) {
      release.current?.();
      release.current = undefined;
    }
  }, [state.isDisabled, state.isReadOnly]);
  return {
    begin(date: CalendarDate, event: PointerEvent<HTMLElement>) {
      if (
        !("anchorDate" in state) ||
        state.isDisabled ||
        state.isReadOnly ||
        event.pointerType !== "mouse" ||
        event.button !== 0 ||
        event.defaultPrevented
      )
        return;
      release.current?.();
      const anchor = state.anchorDate;
      let started = false;
      const element = event.currentTarget;
      const unbind = bindDrag(element, event.nativeEvent, {
        threshold: dragThreshold,
        cancelOnEscape: true,
        onStart() {
          const model = latest.current.state;
          if (!("anchorDate" in model)) return false;
          started = true;
          if (!model.anchorDate) model.setAnchorDate(date);
          model.setDragging(true);
        },
        onMove({ x, y }) {
          const model = latest.current.state;
          if (!("anchorDate" in model)) return;
          const cell = element.ownerDocument
            .elementFromPoint(x, y)
            ?.closest<HTMLElement>("[data-calendar-date]");
          const value = cell?.getAttribute("data-calendar-date");
          if (!value) return;
          const next = toCalendarDate(decodeDate(value, model.focusedDate)!);
          if (!model.isCellDisabled(next) && !model.isCellUnavailable(next))
            model.highlightDate(next);
        },
        onEnd(event, canceled) {
          release.current = undefined;
          const model = latest.current.state;
          if (!("anchorDate" in model)) return;
          if (canceled) {
            model.setAnchorDate(anchor);
            model.setDragging(false);
            return;
          }
          if (started)
            finish.current = requestAnimationFrame(() => {
              const current = latest.current;
              if ("anchorDate" in current.state) {
                current.control.api.run(
                  () => {
                    if ("anchorDate" in current.state) current.state.commitSelection();
                  },
                  { reason: "drag", event },
                );
                current.state.setDragging(false);
              }
            });
        },
      });
      release.current = () => {
        unbind();
        const model = latest.current.state;
        if ("anchorDate" in model) {
          model.setAnchorDate(anchor);
          model.setDragging(false);
        }
      };
    },
    hover(date: CalendarDate) {
      if ("anchorDate" in state && !state.isCellDisabled(date) && !state.isCellUnavailable(date))
        state.highlightDate(date);
    },
  };
}
export const CalendarGestures = createContext<ReturnType<typeof useCalendarGestures> | null>(null);
export function useNativeCalendarCell(date: CalendarDate) {
  const state = useNativeCalendarState();
  const view = use(CalendarView);
  const { locale } = useLocale();
  const control = use(CalendarControlContext)!;
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
  const fullDate = labelFormatter.format(date.toDate(state.timeZone));
  return {
    values,
    native: {
      disabled: state.isDisabled,
      "aria-disabled": disabled || unavailable || undefined,
      tabIndex:
        outside || state.isDisabled
          ? -1
          : control.api.roving.tabIndex(control.state, {
              key: date.toString(),
              props: { value: date.toString() },
            }),
      ref(node: HTMLElement | null) {
        if (!node || outside) return;
        const cleanup = control.api.bind(node, date.toString(), state.isDisabled);
        if (!state.isDisabled && isSameDay(date, state.focusedDate))
          control.api.roving.remember(date.toString());
        return cleanup;
      },
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
      onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
        control.api.navigate(event.nativeEvent);
      },
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
      onClick(event: React.MouseEvent<HTMLElement>, details: ButtonActionDetails) {
        if (!disabled && !unavailable)
          withSource(details.source, () =>
            control.api.run(() => state.selectDate(date), {
              reason: "item-press",
              event: event.nativeEvent,
            }),
          );
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
export function CalendarCell({
  date,
  children,
  xstyle,
  style,
  onClick,
  ...props
}: CalendarCellProps) {
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
        onClick={(event, details) => {
          const result = onClick?.(event, details);
          if (!event.defaultPrevented) native.onClick(event, details);
          return result;
        }}
        data-lenso-slot={props["data-lenso-slot"] ?? "calendar-cell"}
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: unknown })["data-lenso-slot"] ?? "calendar-cell-indicator"
      }
      aria-hidden="true"
    />
  );
}
