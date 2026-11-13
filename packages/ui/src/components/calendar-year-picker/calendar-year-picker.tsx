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
import { usePart, type PartProps } from "@ui-sdk/react/primitive";
import { CollapsibleTrigger, CollapsiblePanel } from "@ui-sdk/react/collapsible";
import { yearPicker } from "@lenso/primitives/model-control";
import { useModelControl, type ModelControlHandle } from "../../utils/model-control.js";
import { withSource } from "@ui-sdk/core/observe";
import { sourceOf, type ChangeSource, type ChangeDetails } from "@ui-sdk/core";
import type { ModelChangeReason, ModelController } from "@lenso/primitives/model-control";
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
}
const TriggerContext = createContext<CalendarYearPickerTriggerRenderProps | null>(null);
export type CalendarYearPickerTriggerProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof CollapsibleTrigger>, "children">
> & { children: ReactNode | ((values: CalendarYearPickerTriggerRenderProps) => ReactNode) };
export function CalendarYearPickerTrigger({
  children,
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
  };
  return (
    <TriggerContext value={values}>
      <CollapsibleTrigger
        {...compiled}
        data-lenso-slot="calendar-year-picker-trigger"
        style={mergeStyle(compiled.style, style)}
        {...props}
        disabled={props.disabled ?? state.isDisabled}
        aria-expanded={isYearPickerOpen}
        aria-label={`${monthYear}, year selector`}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && event.key === "Escape") {
            event.preventDefault();
            withSource("keyboard", () => setIsYearPickerOpen(false));
          }
        }}
      >
        {typeof children === "function" ? children(values) : children}
      </CollapsibleTrigger>
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: unknown })["data-lenso-slot"] ??
        "calendar-year-picker-trigger-heading"
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
      data-lenso-slot={
        (props as { "data-lenso-slot"?: unknown })["data-lenso-slot"] ??
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
type YearItem = { year: number; formatted: string; id: string; modelId: number };
const GridContext = createContext<{
  items: YearItem[];
  control: ModelControlHandle;
  focused: number;
  current: number;
  open: boolean;
  select: (year: number, event?: Event) => void;
} | null>(null);
export type CalendarYearPickerGridProps = StyleXProps<Omit<PartProps<"div">, "children">> & {
  format?: Pick<Intl.DateTimeFormatOptions, "year" | "era">;
  visibleYears?: number;
  controller?: ModelController;
  onValueChange?: (year: number, details: ChangeDetails<ModelChangeReason>) => void;
} & {
  children?: ReactNode;
};
export function CalendarYearPickerGrid({
  children,
  format,
  visibleYears,
  controller: providedController,
  onValueChange,
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
    controller: disclosure,
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
    id: `${item.date.era}:${item.date.year}`,
    modelId: item.id,
  }));
  const selectedId = items.find((item) => item.modelId === model.value)?.id;
  const focused = model.items[model.value as number]?.date.year ?? state.focusedDate.year;
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [geometry, setGeometry] = useState<{ top?: number; height?: number }>({});
  useEffect(() => {
    const dayGrid = calendarRef.current?.querySelector<HTMLElement>(
      `[data-lenso-slot="${calendarGridSlot}"]`,
    );
    if (dayGrid) setGeometry({ top: dayGrid.offsetTop, height: dayGrid.offsetHeight });
  }, [calendarRef, calendarGridSlot, state.focusedDate]);
  const close = (source: ChangeSource) =>
    withSource(source, () => {
      if (setIsYearPickerOpen(false) && !disclosure.isOpen()) disclosure.focus();
    });
  const control = useModelControl<string>(
    yearPicker,
    {
      value: selectedId ?? null,
      disabled: state.isDisabled,
      controller: providedController,
      onValueChange(value, details) {
        const item = items.find((item) => String(item.id) === value);
        if (!item) {
          details.cancel();
          return;
        }
        onValueChange?.(item.year, details);
        if (!details.canceled) {
          model.onChange(item.modelId);
          close(details.source);
        }
      },
    },
    (value) => value,
    (value) => {
      if (typeof value !== "string" || !items.some((item) => String(item.id) === value))
        throw new Error("Expected a visible year");
      return value;
    },
    {
      move(event, from) {
        const index = items.findIndex((item) => String(item.id) === from);
        const steps: Record<string, number> = {
          ArrowRight: direction === "rtl" ? -1 : 1,
          ArrowLeft: direction === "rtl" ? 1 : -1,
          ArrowDown: 3,
          ArrowUp: -3,
        };
        const next =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? items.length - 1
              : steps[event.key] === undefined
                ? undefined
                : Math.max(0, Math.min(items.length - 1, index + steps[event.key]!));
        return next === undefined ? undefined : String(items[next]!.id);
      },
    },
  );
  useEffect(() => {
    if (open) control.handle.api.focus(selectedId);
  }, [open, selectedId, control.handle]);
  const select = (year: number, event?: Event) => {
    const item = items.find((item) => item.year === year);
    if (!item || state.isDisabled) return;
    if (control.handle.api.getValue() === item.id) close(sourceOf(event));
    else
      control.handle.api.setValue(item.id, { reason: "item-press", ...(event ? { event } : {}) });
  };
  const compiled = stylex.props(styles.grid, !open && styles.hidden, xstyle);
  const element = usePart(
    control.handle,
    "root",
    {},
    {
      ...props,
      ...compiled,
      ref(node) {
        const own = assignRef(gridRef, node),
          caller = assignRef(ref, node);
        return () => {
          own();
          caller();
        };
      },
      render,
      "aria-label": model["aria-label"],
      "aria-hidden": !open,
      ...{ "data-lenso-slot": props["data-lenso-slot"] ?? "calendar-year-picker-grid" },
      style: mergeStyle({ ...compiled.style, ...geometry }, style),
      onKeyDown(event) {
        onKeyDown?.(event);
        if (event.defaultPrevented || !open) return;
        if (event.key === "Escape") {
          event.preventDefault();
          close("keyboard");
        } else {
          control.handle.api.navigate(event.nativeEvent);
          if (event.nativeEvent.defaultPrevented) event.preventDefault();
        }
      },
      children,
    },
    "div",
  );
  return (
    <GridContext
      value={{
        items,
        control: control.handle,
        focused,
        current: today(state.timeZone).year,
        open,
        select,
      }}
    >
      <CollapsiblePanel keepMounted>{element}</CollapsiblePanel>
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
  ref,
  style,
  xstyle,
  ...props
}: CalendarYearPickerCellProps) {
  const context = use(GridContext);
  if (!context) throw new Error("Year picker cell requires Grid");
  const item = context.items.find((item) => item.year === year);
  if (!item) return null;
  const selected = year === context.focused;
  const formattedYear = item.formatted;
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
      data-agent-hidden=""
      data-lenso-slot="calendar-year-picker-year-cell"
      style={style}
      {...props}
      disabled={context.control.state.disabled || props.disabled}
      aria-pressed={selected}
      aria-label={formattedYear}
      data-year={year}
      tabIndex={
        context.open && !context.control.state.disabled
          ? Number(
              context.control.api.roving.tabIndex(context.control.state, {
                key: item.id,
                props: { value: String(year) },
              }),
            )
          : -1
      }
      ref={(node) => {
        const own = node ? context.control.api.bind(node, String(item.id)) : undefined;
        const caller = assignRef(ref, node);
        return () => {
          own?.();
          caller();
        };
      }}
      onFocus={(event) => {
        onFocus?.(event);
      }}
      onClick={(event, details) => {
        const result = onClick?.(event, details);
        if (!event.defaultPrevented)
          withSource(details.source, () => context.select(year, event.nativeEvent));
        return result;
      }}
    >
      {typeof children === "function" ? children(values) : (children ?? formattedYear)}
    </Button>
  );
}
