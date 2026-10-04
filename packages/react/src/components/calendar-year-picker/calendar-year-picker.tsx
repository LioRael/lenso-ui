"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
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
import {
  useCalendarHeading,
  useCalendarYearPicker,
  type CalendarHeadingProps,
  type CalendarYearPickerProps,
} from "react-aria/useCalendar";
import { Button } from "react-aria-components/Button";
import { Group } from "react-aria-components/Group";
import { useLocale } from "react-aria-components/I18nProvider";
import { today, startOfYear } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { calendarYearPickerStyles as styles } from "@lenso/tokens/calendar-year-picker";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { racPart } from "../date-input-group/rac-part.js";
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
const Trigger = racPart(
  Button,
  "calendar-year-picker-trigger",
  (state: { isFocusVisible: boolean }) => [styles.trigger, state.isFocusVisible && styles.focused],
);
export function CalendarYearPickerTrigger({
  children,
  onPress,
  onKeyDown,
  ...props
}: CalendarYearPickerTriggerProps) {
  const { isYearPickerOpen, setIsYearPickerOpen } = useYearPicker();
  const state = useCalendarOrRangeState();
  const monthYear = useCalendarHeading({}, state);
  const values = {
    isOpen: isYearPickerOpen,
    monthYear,
    toggle: () => setIsYearPickerOpen(!isYearPickerOpen),
  };
  return (
    <TriggerContext value={values}>
      <Trigger
        {...props}
        slot={null}
        aria-expanded={isYearPickerOpen}
        aria-label={`${monthYear}, year selector`}
        onPress={(event) => {
          onPress?.(event);
          values.toggle();
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
      </Trigger>
    </TriggerContext>
  );
}
export type CalendarYearPickerTriggerHeadingProps = StyleXProps<
  Omit<ComponentPropsWithRef<"span">, "children">
> &
  Pick<CalendarHeadingProps, "offset" | "format"> & {
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
  const heading = useCalendarHeading(
    { ...(format === undefined ? {} : { format }), ...(offset === undefined ? {} : { offset }) },
    state,
  );
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
  Omit<ComponentPropsWithRef<typeof Group>, "children">
> &
  Pick<CalendarYearPickerProps, "format" | "visibleYears"> & { children?: ReactNode };
export function CalendarYearPickerGrid({
  children,
  format,
  visibleYears,
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
  const { direction } = useLocale();
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
  const model = useCalendarYearPicker(
    { ...(format === undefined ? {} : { format }), visibleYears: visibleYears ?? yearCount },
    state,
  );
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
      <Group
        {...props}
        {...compiled}
        ref={gridRef}
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
      </Group>
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
const Cell = racPart(
  Button,
  "calendar-year-picker-year-cell",
  (state: { isHovered: boolean; isFocusVisible: boolean }) => [
    styles.cell,
    state.isHovered && styles.hovered,
    state.isFocusVisible && styles.focused,
  ],
);
export type CalendarYearPickerCellProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof Button>, "children">
> & {
  year: number;
  children?: ReactNode | ((values: CalendarYearPickerCellRenderProps) => ReactNode);
};
export function CalendarYearPickerCell({
  year,
  children,
  onPress,
  onFocus,
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
    <Cell
      {...props}
      slot={null}
      aria-pressed={selected}
      aria-label={formattedYear}
      data-year={year}
      excludeFromTabOrder={!(context.open && context.active === year)}
      xstyle={[selected && styles.selected, xstyle]}
      onFocus={(event) => {
        onFocus?.(event);
        context.setActive(year);
      }}
      onPress={(event) => {
        onPress?.(event);
        context.select(year);
      }}
    >
      {typeof children === "function" ? children(values) : (children ?? formattedYear)}
    </Cell>
  );
}
