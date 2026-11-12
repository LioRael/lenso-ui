"use client";
// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import {
  createContext,
  use,
  useRef,
  useEffect,
  useState,
  Fragment,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import { NativeButton as Button } from "../../utils/native-button.js";
import { useRender } from "@base-ui/react/use-render";
import { useLocale } from "../../utils/locale.js";
import {
  calendarHeading,
  calendarYears,
  type CalendarHeadingFormat,
} from "../../utils/calendar-state.js";
import { assignRef } from "../../utils/interaction/ref.js";
import type { DateDuration } from "@internationalized/date";
import { today, startOfYear } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { calendarYearPickerStyles as styles } from "@lenso/tokens/calendar-year-picker";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useYearPicker, useCalendarOrRangeState } from "./year-picker-context.js";
export interface CalendarYearPickerTriggerRenderProps {
  isOpen: boolean;
  monthYear: string;
  toggle: () => void;
}
const TriggerContext = createContext<CalendarYearPickerTriggerRenderProps | null>(null);
export type CalendarYearPickerTriggerProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof Button>, "children">
> & { children: ReactNode | ((values: CalendarYearPickerTriggerRenderProps) => ReactNode) };
export function CalendarYearPickerTrigger({
  children,
  onClick,
  onKeyDown,
  xstyle,
  style,
  ...props
}: CalendarYearPickerTriggerProps) {
  const { isYearPickerOpen, setIsYearPickerOpen } = useYearPicker();
  const state = useCalendarOrRangeState();
  const { locale } = useLocale();
  const monthYear = calendarHeading(state, locale);
  const compiled = stylex.props(styles.trigger, xstyle);
  const values = {
    isOpen: isYearPickerOpen,
    monthYear,
    toggle: () => setIsYearPickerOpen(!isYearPickerOpen),
  };
  return (
    <TriggerContext value={values}>
      <Button
        {...compiled}
        data-slot="calendar-year-picker-trigger"
        style={mergeStyle(compiled.style, style)}
        {...props}
        aria-expanded={isYearPickerOpen}
        aria-label={`${monthYear}, year selector`}
        onClick={(event, details) => {
          onClick?.(event, details);
          if (!event.defaultPrevented) values.toggle();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && event.key === "Escape") {
            event.preventDefault();
            setIsYearPickerOpen(false);
          }
        }}
      >
        {typeof children === "function" ? children(values) : children}
      </Button>
    </TriggerContext>
  );
}
export type CalendarYearPickerTriggerHeadingProps = StyleXProps<
  Omit<ComponentPropsWithRef<"span">, "children">
> & { offset?: DateDuration; format?: CalendarHeadingFormat } & {
  children?: ReactNode | ((values: CalendarYearPickerTriggerRenderProps) => ReactNode);
};
export function CalendarYearPickerTriggerHeading({
  children,
  format,
  offset,
  xstyle,
  style,
  ...props
}: CalendarYearPickerTriggerHeadingProps) {
  const values = use(TriggerContext);
  const state = useCalendarOrRangeState();
  const { locale } = useLocale();
  const heading = calendarHeading(state, locale, { format, offset });
  if (!values) throw new Error("Year picker heading requires Trigger");
  const compiled = stylex.props(styles.heading, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={
        (props as { "data-slot"?: unknown })["data-slot"] ?? "calendar-year-picker-trigger-heading"
      }
    >
      {typeof children === "function" ? children(values) : (children ?? heading)}
    </span>
  );
}
export type CalendarYearPickerTriggerIndicatorProps = StyleXProps<
  Omit<ComponentPropsWithRef<"span">, "children">
> & { children?: ReactNode | ((values: CalendarYearPickerTriggerRenderProps) => ReactNode) };
export function CalendarYearPickerTriggerIndicator({
  children,
  xstyle,
  style,
  ...props
}: CalendarYearPickerTriggerIndicatorProps) {
  const values = use(TriggerContext);
  if (!values) throw new Error("Year picker indicator requires Trigger");
  const compiled = stylex.props(styles.indicator, values.isOpen && styles.openIndicator, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={
        (props as { "data-slot"?: unknown })["data-slot"] ??
        "calendar-year-picker-trigger-indicator"
      }
      aria-hidden="true"
    >
      {typeof children === "function"
        ? children(values)
        : (children ?? (
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          ))}
    </span>
  );
}
export interface CalendarYearPickerCellRenderProps {
  year: number;
  formattedYear: string;
  isSelected: boolean;
  isCurrentYear: boolean;
  isOpen: boolean;
  selectYear: () => void;
}
type YearItem = { year: number; formatted: string; id: number };
const GridContext = createContext<{
  items: YearItem[];
  active: number;
  focused: number;
  current: number;
  open: boolean;
  setActive: (year: number) => void;
  select: (year: number) => void;
} | null>(null);
export type CalendarYearPickerGridProps = StyleXProps<
  Omit<useRender.ComponentProps<"div">, "children">
> & { format?: Pick<Intl.DateTimeFormatOptions, "year" | "era">; visibleYears?: number } & {
  children?: ReactNode;
};
export function CalendarYearPickerGrid({
  children,
  format,
  visibleYears,
  ref,
  render,
  xstyle,
  onKeyDown,
  style,
  ...props
}: CalendarYearPickerGridProps) {
  const {
    calendarRef,
    calendarGridSlot,
    isYearPickerOpen: open,
    setIsYearPickerOpen,
  } = useYearPicker();
  const state = useCalendarOrRangeState();
  const { direction, locale } = useLocale();
  let yearCount = 20;
  if (state.minValue && state.maxValue) {
    yearCount = 0;
    let date = startOfYear(state.minValue);
    while (date.compare(state.maxValue) <= 0) {
      yearCount++;
      const next = startOfYear(date.add({ years: 1 }));
      if (next.compare(date) <= 0) break;
      date = next;
    }
  }
  const model = calendarYears(state, locale, visibleYears ?? yearCount, format);
  const items = model.items.map((item) => ({
    year: item.date.year,
    formatted: item.formatted,
    id: item.id as number,
  }));
  const focused = model.items[model.value as number]?.date.year ?? state.focusedDate.year;
  const [active, setActive] = useState(focused);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [geometry, setGeometry] = useState<{ top?: number; height?: number }>({});
  const wasOpen = useRef(false);
  const focus = (year: number) =>
    gridRef.current?.querySelector<HTMLElement>(`[data-year="${year}"]`)?.focus();
  useEffect(() => {
    const dayGrid = calendarRef.current?.querySelector<HTMLElement>(
      `[data-slot="${calendarGridSlot}"]`,
    );
    if (dayGrid) setGeometry({ top: dayGrid.offsetTop, height: dayGrid.offsetHeight });
  }, [calendarRef, calendarGridSlot, state.focusedDate]);
  useEffect(() => {
    const justOpened = open && !wasOpen.current;
    wasOpen.current = open;
    if (!justOpened) return;
    setActive(focused);
    const frame = requestAnimationFrame(() => focus(focused));
    return () => cancelAnimationFrame(frame);
  }, [open, focused]);
  const close = () => {
    setIsYearPickerOpen(false);
    requestAnimationFrame(() =>
      calendarRef.current
        ?.querySelector<HTMLElement>('[data-slot="calendar-year-picker-trigger"]')
        ?.focus(),
    );
  };
  const select = (year: number) => {
    const item = items.find((candidate) => candidate.year === year);
    if (!item) return;
    model.onChange(item.id);
    close();
  };
  const compiled = stylex.props(styles.grid, !open && styles.hidden, xstyle);
  return (
    <GridContext
      value={{
        items,
        active,
        focused,
        current: today(state.timeZone).year,
        open,
        setActive,
        select,
      }}
    >
      <YearGrid
        {...props}
        {...compiled}
        ref={(node) => {
          const own = assignRef(gridRef, node);
          const caller = assignRef(ref, node);
          return () => {
            own();
            caller();
          };
        }}
        render={render}
        aria-label={model["aria-label"]}
        aria-hidden={!open}
        data-slot={(props as { "data-slot"?: unknown })["data-slot"] ?? "calendar-year-picker-grid"}
        style={mergeStyle({ ...compiled.style, ...geometry }, style)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || !open) return;
          if (event.key === "Escape") {
            event.preventDefault();
            close();
            return;
          }
          const index = items.findIndex((item) => item.year === active);
          const steps: Record<string, number> = {
            ArrowRight: direction === "rtl" ? -1 : 1,
            ArrowLeft: direction === "rtl" ? 1 : -1,
            ArrowDown: 3,
            ArrowUp: -3,
          };
          let next = index;
          if (event.key === "Home") next = 0;
          else if (event.key === "End") next = items.length - 1;
          else if (steps[event.key] !== undefined)
            next = Math.max(0, Math.min(items.length - 1, index + steps[event.key]!));
          else return;
          const year = items[next]?.year;
          if (year !== undefined) {
            event.preventDefault();
            setActive(year);
            focus(year);
          }
        }}
      >
        {children}
      </YearGrid>
    </GridContext>
  );
}
export type CalendarYearPickerGridBodyProps = {
  children?: (values: CalendarYearPickerCellRenderProps) => ReactNode;
};
export function CalendarYearPickerGridBody({ children }: CalendarYearPickerGridBodyProps) {
  const context = use(GridContext);
  if (!context) throw new Error("Year picker body requires Grid");
  return context.items.map((item) => (
    <Fragment key={item.id}>
      {children ? (
        children({
          year: item.year,
          formattedYear: item.formatted,
          isSelected: item.year === context.focused,
          isCurrentYear: item.year === context.current,
          isOpen: context.open,
          selectYear: () => context.select(item.year),
        })
      ) : (
        <CalendarYearPickerCell year={item.year} />
      )}
    </Fragment>
  ));
}
export type CalendarYearPickerCellProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof Button>, "children">
> & {
  year: number;
  children?: ReactNode | ((values: CalendarYearPickerCellRenderProps) => ReactNode);
};
export function CalendarYearPickerCell({
  year,
  children,
  onClick,
  onFocus,
  style,
  xstyle,
  ...props
}: CalendarYearPickerCellProps) {
  const context = use(GridContext);
  if (!context) throw new Error("Year picker cell requires Grid");
  const selected = year === context.focused;
  const formattedYear = context.items.find((item) => item.year === year)?.formatted ?? String(year);
  const values = {
    year,
    formattedYear,
    isSelected: selected,
    isCurrentYear: year === context.current,
    isOpen: context.open,
    selectYear: () => context.select(year),
  };
  return (
    <Button
      {...stylex.props(styles.cell, selected && styles.selected, xstyle)}
      data-slot="calendar-year-picker-year-cell"
      style={style}
      {...props}
      aria-pressed={selected}
      aria-label={formattedYear}
      data-year={year}
      tabIndex={context.open && context.active === year ? 0 : -1}
      onFocus={(event) => {
        onFocus?.(event);
        context.setActive(year);
      }}
      onClick={(event, details) => {
        onClick?.(event, details);
        if (!event.defaultPrevented) context.select(year);
      }}
    >
      {typeof children === "function" ? children(values) : (children ?? formattedYear)}
    </Button>
  );
}

function YearGrid({ render, ref, ...props }: useRender.ComponentProps<"div">) {
  return useRender({ defaultTagName: "div", render, ref, props: { role: "group", ...props } });
}
