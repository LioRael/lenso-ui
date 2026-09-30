"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import {
  createContext,
  use,
  useMemo,
  cloneElement,
  Children,
  isValidElement,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Calendar as Primitive,
  CalendarHeading,
  CalendarGrid as Grid,
  CalendarGridHeader as GridHeader,
  CalendarGridBody as GridBody,
  CalendarHeaderCell,
  CalendarCell as Cell,
  type DateValue,
  type CalendarSelectionMode,
  type CalendarProps,
} from "react-aria-components/Calendar";
import { Button } from "react-aria-components/Button";
import { useLocale } from "react-aria-components/I18nProvider";
import {
  CalendarDate,
  DateFormatter,
  createCalendar,
  getLocalTimeZone,
  startOfWeek,
  today,
  type CalendarIdentifier,
  type CalendarDate as CalendarDateType,
} from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { calendarStyles as styles } from "@lenso/tokens/calendar";
import { styledPart, mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { racPart } from "../date-input-group/rac-part.js";
import {
  YearPickerProvider,
  useYearPicker,
  useCalendarOrRangeState,
  type YearPickerOptions,
} from "../calendar-year-picker/year-picker-context.js";
export const CalendarView = createContext<{
  days?: number | undefined;
  firstDayOfWeek?: CalendarProps<DateValue>["firstDayOfWeek"];
  weekdayStyle?: "narrow" | "short" | "long";
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
export type CalendarRootProps<
  T extends DateValue = DateValue,
  M extends CalendarSelectionMode = "single",
> = StyleXProps<CalendarProps<T, M>> & YearPickerOptions;
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
function CalendarInner<T extends DateValue, M extends CalendarSelectionMode>({
  xstyle,
  style,
  minValue,
  maxValue,
  ...props
}: StyleXProps<CalendarProps<T, M>>) {
  const { calendarRef } = useYearPicker();
  const bounds = useCalendarBounds(minValue, maxValue);
  const compiled = stylex.props(styles.root, xstyle);
  const selection = props.value ?? props.defaultValue;
  // RAC 1.21 treats an empty selection array as a date and clamps it to minValue.
  const defaultFocusedValue =
    props.defaultFocusedValue ??
    (props.selectionMode === "multiple" && Array.isArray(selection) && selection.length === 0
      ? today(getLocalTimeZone())
      : null);
  return (
    <CalendarView
      value={{ days: props.visibleDuration?.days, firstDayOfWeek: props.firstDayOfWeek }}
    >
      <Primitive<T, M>
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        minValue={bounds.minValue as T}
        maxValue={bounds.maxValue as T}
        defaultFocusedValue={defaultFocusedValue}
        ref={calendarRef}
        data-slot="calendar"
      />
    </CalendarView>
  );
}
export const CalendarHeader = styledPart("header", "calendar-header", styles.header);
export const CalendarHeadingPart = styledPart(CalendarHeading, "calendar-heading", styles.heading);
const Nav = racPart(
  Button,
  "calendar-nav-button",
  (state: {
    isHovered: boolean;
    isPressed: boolean;
    isFocusVisible: boolean;
    isDisabled: boolean;
  }) => [
    styles.navButton,
    state.isHovered && styles.hovered,
    state.isPressed && styles.pressed,
    state.isFocusVisible && styles.focused,
    state.isDisabled && styles.disabled,
  ],
);
export function CalendarNavButton({
  children,
  slot,
  xstyle,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Button>>) {
  const { isYearPickerOpen } = useYearPicker();
  const { direction } = useLocale();
  return (
    <Nav
      {...props}
      {...(slot === undefined ? {} : { slot })}
      xstyle={[isYearPickerOpen && styles.navHidden, xstyle]}
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
          <path d={slot === "previous" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"} />
        </svg>
      )}
    </Nav>
  );
}
const CalendarGridPart = styledPart(Grid, "calendar-grid", styles.grid);
export function CalendarGrid({
  children,
  weekdayStyle = "short",
  xstyle,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Grid>>) {
  const view = use(CalendarView);
  const { isYearPickerOpen, calendarGridSlot } = useYearPicker();
  return (
    <CalendarView value={{ ...view, weekdayStyle }}>
      <CalendarGridPart
        {...props}
        data-slot={calendarGridSlot}
        weekdayStyle={weekdayStyle}
        xstyle={[
          view.days != null && styles.dayGrid,
          isYearPickerOpen && styles.gridHidden,
          xstyle,
        ]}
      >
        {typeof children === "function" ? (
          <>
            <CalendarGridHeader>
              {(day) => <CalendarHeaderCellPart>{day}</CalendarHeaderCellPart>}
            </CalendarGridHeader>
            <CalendarGridBody>{children}</CalendarGridBody>
          </>
        ) : (
          (children ?? [])
        )}
      </CalendarGridPart>
    </CalendarView>
  );
}
function styledRows(children: ReactNode) {
  return Children.map(children, (row) => {
    if (!isValidElement(row) || row.type !== "tr") return row;
    const element = row as ReactElement<ComponentPropsWithRef<"tr">>;
    const compiled = stylex.props(styles.row);
    return cloneElement(element, {
      ...compiled,
      className: [compiled.className, element.props.className].filter(Boolean).join(" "),
      style: { ...compiled.style, ...element.props.style },
    });
  });
}
const Header = styledPart(GridHeader, "calendar-grid-header", styles.section);
export function CalendarGridHeader({
  children,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof GridHeader>>) {
  const view = use(CalendarView);
  const state = useCalendarOrRangeState();
  const { locale } = useLocale();
  if ((view.days ?? 0) < 7 || typeof children !== "function")
    return (
      <Header
        {...props}
        xstyle={[view.days != null && styles.daySection, xstyle]}
        {...(style === undefined ? {} : { style })}
        render={(domProps, values) => {
          const next = { ...domProps, children: styledRows(domProps.children) };
          return render ? render(next, values) : <thead {...next} />;
        }}
      >
        {children}
      </Header>
    );
  const start = startOfWeek(state.visibleRange.start, locale, view.firstDayOfWeek);
  const formatter = new Intl.DateTimeFormat(locale, {
    weekday: view.weekdayStyle ?? "short",
    timeZone: state.timeZone,
  });
  const compiled = stylex.props(styles.daySection, xstyle);
  const domProps = {
    ...props,
    ...compiled,
    style: { ...compiled.style, ...style },
    "aria-hidden": true as const,
    "data-slot": "calendar-grid-header",
    children: (
      <tr {...stylex.props(styles.row)}>
        {Array.from({ length: 7 }, (_, index) =>
          cloneElement(
            children(formatter.format(start.add({ days: index }).toDate(state.timeZone))),
            { key: index },
          ),
        )}
      </tr>
    ),
  };
  return render ? render(domProps, undefined) : <thead {...domProps} />;
}
const Body = styledPart(GridBody, "calendar-grid-body", styles.section);
export function CalendarGridBody({
  children,
  render,
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof GridBody>>) {
  const view = use(CalendarView);
  const state = useCalendarOrRangeState();
  const { locale } = useLocale();
  if ((view.days ?? 0) < 7 || typeof children !== "function")
    return (
      <Body
        {...props}
        xstyle={[
          view.days != null && styles.daySection,
          view.days != null && styles.dayBody,
          xstyle,
        ]}
        {...(style === undefined ? {} : { style })}
        render={(domProps, values) => {
          const next = { ...domProps, children: styledRows(domProps.children) };
          return render ? render(next, values) : <tbody {...next} />;
        }}
      >
        {children}
      </Body>
    );
  const rows = [];
  let rowStart = startOfWeek(state.visibleRange.start, locale, view.firstDayOfWeek);
  while (rowStart.compare(state.visibleRange.end) <= 0) {
    const cells = Array.from({ length: 7 }, (_, index) => {
      const date = rowStart.add({ days: index });
      return date.compare(state.visibleRange.end) <= 0 ? (
        cloneElement(children(date as CalendarDateType), { key: index })
      ) : (
        <td key={index} aria-hidden="true" />
      );
    });
    rows.push(
      <tr key={rowStart.toString()} {...stylex.props(styles.row)}>
        {cells}
      </tr>,
    );
    const next = rowStart.add({ weeks: 1 });
    if (next.compare(rowStart) === 0) break;
    rowStart = next;
  }
  const compiled = stylex.props(styles.daySection, styles.dayBody, xstyle);
  const domProps = {
    ...props,
    ...compiled,
    style: { ...compiled.style, ...style },
    "data-slot": "calendar-grid-body",
    children: rows,
  };
  return render ? render(domProps, undefined) : <tbody {...domProps} />;
}
export const CalendarHeaderCellPart = styledPart(
  CalendarHeaderCell,
  "calendar-header-cell",
  styles.headerCell,
);
export const CalendarCellSelection = createContext(false);
const CalendarCellPart = racPart(
  Cell,
  "calendar-cell",
  (state: {
    isToday: boolean;
    isSelected: boolean;
    isHovered: boolean;
    isPressed: boolean;
    isFocusVisible: boolean;
    isOutsideMonth: boolean;
    isDisabled: boolean;
    isUnavailable: boolean;
  }) => [
    styles.cell,
    state.isToday && styles.today,
    state.isHovered && styles.hovered,
    state.isSelected && styles.selected,
    state.isSelected && state.isHovered && styles.selectedHovered,
    state.isPressed && styles.pressed,
    state.isFocusVisible && styles.focused,
    state.isOutsideMonth && styles.outside,
    (state.isDisabled || state.isUnavailable) && styles.unavailable,
  ],
);
export function CalendarCell({
  children,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Cell>>) {
  return (
    <CalendarCellPart {...props}>
      {(state) => (
        <CalendarCellSelection value={state.isSelected}>
          {typeof children === "function" ? children(state) : (children ?? state.formattedDate)}
        </CalendarCellSelection>
      )}
    </CalendarCellPart>
  );
}
const Indicator = styledPart("span", "calendar-cell-indicator", styles.indicator);
export function CalendarCellIndicator({
  xstyle,
  ...props
}: StyleXProps<ComponentPropsWithRef<"span">>) {
  const selected = use(CalendarCellSelection);
  return (
    <Indicator
      {...props}
      aria-hidden="true"
      xstyle={[selected && styles.selectedIndicator, xstyle]}
    />
  );
}
