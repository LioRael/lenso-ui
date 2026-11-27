// Copyright NextUI Inc. Apache-2.0. Modified for Solid.
import { calendarYearPickerStyles as s } from "@lenso/tokens/calendar-year-picker";
import {
  yearPicker,
  type ModelController,
  type ModelChangeReason,
} from "@lenso/primitives/model-control";
import { isRTL, type ChangeDetails } from "@ui-sdk/core";
import type { CalendarController, CalendarState } from "@ui-sdk/solid/calendar";
import { Button } from "@ui-sdk/solid/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
  createCollapsibleController,
} from "@ui-sdk/solid/collapsible";
import { usePrimitive, usePart, type PrimitiveHandle } from "@ui-sdk/solid/primitive";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  For,
  merge,
  omit,
  useContext,
  type ComponentProps,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { attributes, htmlPart, sdkPart, type StyledPart } from "./parts.js";
export type YearPickerOptions = {
  isYearPickerOpen?: boolean;
  defaultYearPickerOpen?: boolean;
  onYearPickerOpenChange?: ComponentProps<typeof Collapsible>["onOpenChange"];
};
type ProviderProps = YearPickerOptions & {
  state: CalendarState;
  controller: CalendarController;
  min?: string;
  max?: string;
  locale?: string;
  children?: JSX.Element;
};
export const YearContext = createContext<
  | (ProviderProps & {
      disclosure: ReturnType<typeof createCollapsibleController>;
      open: () => boolean;
      close: () => void;
    })
  | null
>(null);
export function YearProvider(props: ProviderProps) {
  const disclosure = createCollapsibleController();
  const [local, setLocal] = createSignal(props.defaultYearPickerOpen ?? false);
  const open = () => props.isYearPickerOpen ?? local();
  const close = () => {
    if (disclosure.setOpen(false)) disclosure.focus();
  };
  return (
    <YearContext value={merge(props, { open, close, disclosure })}>
      <Collapsible
        {...attributes(s.provider)}
        open={open()}
        controller={disclosure}
        disabled={props.state.disabled}
        onOpenChange={(value, details) => {
          props.onYearPickerOpenChange?.(value, details);
          if (!details.canceled && props.isYearPickerOpen === undefined) setLocal(value);
        }}
      >
        {props.children}
      </Collapsible>
    </YearContext>
  );
}
function date(year: number, month = 1) {
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, 1);
  return d;
}
function heading(p: ProviderProps) {
  const [y, m] = p.state.month.split("-").map(Number);
  return new Intl.DateTimeFormat(p.locale ?? "en", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date(y!, m));
}
const Heading = htmlPart("span", "calendar-year-picker-heading", () => s.heading);
const Indicator = htmlPart("span", "calendar-year-picker-indicator", () => s.indicator);
export function CalendarYearPickerTriggerHeading(props: ComponentProps<typeof Heading>) {
  const p = useContext(YearContext)!;
  return <Heading {...props}>{props.children ?? heading(p)}</Heading>;
}
export function CalendarYearPickerTriggerIndicator(props: ComponentProps<typeof Indicator>) {
  const p = useContext(YearContext)!;
  return (
    <Indicator aria-hidden="true" {...props} xstyle={[p.open() && s.openIndicator, props.xstyle]}>
      {props.children ?? "›"}
    </Indicator>
  );
}
const Trigger: StyledPart<typeof CollapsibleTrigger> = sdkPart(
  CollapsibleTrigger,
  "calendar-year-picker-trigger",
  () => s.trigger,
);
export function CalendarYearPickerTrigger(props: ComponentProps<typeof Trigger>) {
  const p = useContext(YearContext)!;
  return (
    <Trigger aria-label={heading(p) + ", year selector"} {...props}>
      {props.children ?? (
        <>
          <CalendarYearPickerTriggerHeading />
          <CalendarYearPickerTriggerIndicator />
        </>
      )}
    </Trigger>
  );
}
type GridModel = {
  years: () => number[];
  format: (value: number) => string;
  current: () => number;
  handle: PrimitiveHandle<typeof yearPicker>;
  select: (year: number, event?: Event) => void;
};
const GridContext = createContext<GridModel>();
const Cell: StyledPart<typeof Button> = sdkPart(
  Button,
  "calendar-year-picker-year-cell",
  () => s.cell,
);
export function CalendarYearPickerCell(props: ComponentProps<typeof Cell> & { year: number }) {
  const grid = useContext(GridContext);
  const p = useContext(YearContext)!;
  const [node, setNode] = createSignal<HTMLButtonElement>();
  createEffect(
    () => [node(), props.year, props.disabled] as const,
    ([el, y, d]) => (el ? grid.handle.api.bind(el, String(y), !!d) : undefined),
  );
  return (
    <Cell
      {...omit(props, "year", "ref", "children", "onClick", "xstyle")}
      ref={[setNode, props.ref]}
      data-year={props.year}
      aria-label={grid.format(props.year)}
      aria-pressed={grid.current() === props.year ? "true" : "false"}
      tabindex={p.open() && grid.current() === props.year ? 0 : -1}
      xstyle={[grid.current() === props.year && s.selected, props.xstyle]}
      onClick={(e, d) => {
        const cb = props.onClick;
        if (typeof cb === "function") cb(e, d);
        else if (cb) cb[0](cb[1], e, d);
        if (!e.defaultPrevented) grid.select(props.year, e);
      }}
    >
      {props.children ?? grid.format(props.year)}
    </Cell>
  );
}
export function CalendarYearPickerGridBody(props: { children?: (year: number) => JSX.Element }) {
  const g = useContext(GridContext);
  return (
    <For each={g.years()}>{(y) => props.children?.(y) ?? <CalendarYearPickerCell year={y} />}</For>
  );
}
export function CalendarYearPickerGrid(props: {
  visibleYears?: number;
  controller?: ModelController;
  onValueChange?: (year: number, details: ChangeDetails<ModelChangeReason>) => void;
  children?: JSX.Element;
}) {
  const p = useContext(YearContext)!;
  const [grid, setGrid] = createSignal<HTMLDivElement>();
  createEffect(grid, (node) => {
    const day = node
      ?.closest('[data-lenso-slot="calendar"]')
      ?.querySelector<HTMLElement>('[data-lenso-slot="calendar-grid"]');
    if (!node || !day) return;
    const measure = () => {
      node.style.top = day.offsetTop + "px";
      node.style.height = day.offsetHeight + "px";
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(day);
    return () => observer.disconnect();
  });
  const current = () => Number(p.state.month.slice(0, 4));
  const years = createMemo(() => {
    const min = Number(p.min?.slice(0, 4) ?? 1),
      max = Number(p.max?.slice(0, 4) ?? 9999);
    const count = Math.min(
      max - min + 1,
      Math.max(1, Math.trunc(props.visibleYears ?? (p.min && p.max ? max - min + 1 : 20))),
    );
    const first = Math.min(max - count + 1, Math.max(min, current() - Math.floor(count / 2)));
    return Array.from({ length: count }, (_, i) => first + i);
  });
  const format = (y: number) =>
    new Intl.DateTimeFormat(p.locale ?? "en", { year: "numeric", timeZone: "UTC" }).format(date(y));
  const handle = usePrimitive(yearPicker, () => ({
    value: String(current()),
    controller: props.controller,
    disabled: p.state.disabled,
    validate: (v) => p.open() && years().includes(Number(v)),
    onValueChange(v, details) {
      const y = Number(v);
      props.onValueChange?.(y, details);
      if (details.canceled) return;
      let month = String(y).padStart(4, "0") + p.state.month.slice(4);
      if (p.min && month < p.min.slice(0, 7)) month = p.min.slice(0, 7);
      if (p.max && month > p.max.slice(0, 7)) month = p.max.slice(0, 7);
      if (
        month !== p.state.month &&
        !p.controller.setMonth(month, { reason: "select-change", event: details.event })
      ) {
        details.cancel();
        return;
      }
      p.close();
    },
    move(e, from) {
      const rtl = e.target instanceof HTMLElement && isRTL(e.target);
      const step = (
        { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1, ArrowUp: -3, ArrowDown: 3 } as Record<
          string,
          number
        >
      )[e.key];
      const list = years();
      const i =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? list.length - 1
            : step === undefined
              ? -1
              : Math.max(0, Math.min(list.length - 1, list.indexOf(Number(from)) + step));
      return list[i] === undefined ? undefined : String(list[i]);
    },
  }));
  const select = (y: number, event?: Event) => {
    if (current() === y) p.close();
    else handle.api.setValue(String(y), { reason: "item-press", event });
  };
  createEffect(
    () => p.open(),
    (open) => {
      if (open)
        queueMicrotask(() => {
          if (p.open()) handle.api.focus(String(current()));
        });
    },
  );
  return (
    <GridContext value={{ handle, current, years, format, select }}>
      <CollapsiblePanel>
        {usePart(
          handle,
          "root",
          () => ({}),
          merge(attributes(s.grid), {
            ref: setGrid,
            role: "group" as const,
            "aria-label": "Years",
            "data-lenso-slot": "calendar-year-picker-grid",
            onKeyDown(e: KeyboardEvent) {
              if (e.key === "Escape") {
                e.preventDefault();
                p.close();
              } else handle.api.navigate(e);
            },
            get children() {
              return props.children ?? <CalendarYearPickerGridBody />;
            },
          }),
          "div",
        )}
      </CollapsiblePanel>
    </GridContext>
  );
}

export { YearContext as YearPickerContext };
export function useYearPicker() {
  const context = useContext(YearContext);
  if (!context) throw new Error("Year picker requires Calendar or RangeCalendar");
  return {
    controller: context.disclosure,
    get isYearPickerOpen() {
      return context.open();
    },
    setIsYearPickerOpen: context.disclosure.setOpen,
  };
}
export function useCalendarOrRangeState() {
  const context = useContext(YearContext);
  if (!context) throw new Error("Calendar state requires Calendar or RangeCalendar");
  return () => context.state;
}
