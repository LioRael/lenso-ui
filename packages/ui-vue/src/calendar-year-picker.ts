// Copyright NextUI Inc. Apache-2.0. Modified for Vue.
import { calendarYearPickerStyles as s } from "@lenso/tokens/calendar-year-picker";
import {
  yearPicker,
  type ModelController,
  type ModelChangeReason,
} from "@lenso/primitives/model-control";
import { isRTL, type ChangeDetails } from "@ui-sdk/core";
import {
  CalendarYearSelect,
  type CalendarController,
  type CalendarState,
} from "@ui-sdk/vue/calendar";
import { calendarStyles } from "@lenso/tokens/calendar";
import { Button, type ButtonActionDetails } from "@ui-sdk/vue/button";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsiblePanel,
  createCollapsibleController,
} from "@ui-sdk/vue/collapsible";
import { usePrimitive, usePart, type PrimitiveHandle } from "@ui-sdk/vue/primitive";
import * as stylex from "@stylexjs/stylex";
import {
  computed,
  defineComponent,
  h,
  inject,
  mergeProps,
  nextTick,
  provide,
  shallowRef,
  watch,
  watchPostEffect,
  type HTMLAttributes,
  type InjectionKey,
  type PropType,
  type SlotsType,
  type VNode,
  type VNodeChild,
} from "vue";
import {
  partAttributes,
  sdkPart,
  type ComponentProps,
  type HtmlPart,
  type StyleXArgument,
  type StyledPart,
} from "./parts.js";

type OpenChange = ComponentProps<typeof Collapsible>["onOpenChange"];
export type YearPickerOptions = {
  isYearPickerOpen?: boolean;
  defaultYearPickerOpen?: boolean;
  onYearPickerOpenChange?: OpenChange;
  "onUpdate:isYearPickerOpen"?: (value: boolean) => void;
};
type ProviderModel = {
  state: () => CalendarState;
  calendar: () => CalendarController;
  min: () => string | undefined;
  max: () => string | undefined;
  locale: () => string;
  disclosure: ReturnType<typeof createCollapsibleController>;
  open: () => boolean;
  close: () => void;
};
export const YearPickerContext: InjectionKey<ProviderModel> = Symbol("LensoYearPicker");
export const yearPickerProps = {
  isYearPickerOpen: { type: Boolean, default: undefined },
  defaultYearPickerOpen: Boolean,
  onYearPickerOpenChange: Function as PropType<OpenChange>,
};
export const YearProvider = defineComponent({
  props: {
    ...yearPickerProps,
    state: { type: Object as PropType<CalendarState>, required: true },
    calendar: { type: Object as PropType<CalendarController>, required: true },
    min: String,
    max: String,
    locale: String,
  },
  emits: { "update:isYearPickerOpen": (_value: boolean) => true },
  setup(props, { slots, emit }) {
    const disclosure = createCollapsibleController();
    const local = shallowRef(props.defaultYearPickerOpen);
    const open = () => props.isYearPickerOpen ?? local.value;
    provide(YearPickerContext, {
      state: () => props.state,
      calendar: () => props.calendar,
      min: () => props.min,
      max: () => props.max,
      locale: () => props.locale ?? "en",
      disclosure,
      open,
      close() {
        if (disclosure.setOpen(false)) disclosure.focus();
      },
    });
    return () =>
      h(
        Collapsible,
        {
          ...stylex.attrs(s.provider),
          controller: disclosure,
          open: open(),
          disabled: props.state.disabled,
          onOpenChange(value, details) {
            props.onYearPickerOpenChange?.(value, details);
            if (details.canceled) return;
            if (props.isYearPickerOpen === undefined) local.value = value;
            emit("update:isYearPickerOpen", value);
          },
        },
        { default: slots["default"] },
      );
  },
});
function useProvider() {
  const provider = inject(YearPickerContext, undefined);
  if (!provider) throw new Error("Year picker requires Calendar or RangeCalendar");
  return provider;
}
function date(year: number, month = 1) {
  const result = new Date(0);
  result.setUTCFullYear(year, month - 1, 1);
  return result;
}
function heading(provider: ProviderModel) {
  const [year, month] = provider.state().month.split("-").map(Number);
  return new Intl.DateTimeFormat(provider.locale(), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date(year!, month));
}

export const CalendarYearPickerTriggerHeading: HtmlPart<"span"> = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const provider = useProvider();
    return () =>
      h(
        "span",
        partAttributes("calendar-year-picker-heading", s.heading, attrs),
        slots["default"]?.() ?? heading(provider),
      );
  },
}) as unknown as HtmlPart<"span">;
export const CalendarYearPickerTriggerIndicator: HtmlPart<"span"> = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const provider = useProvider();
    return () =>
      h(
        "span",
        partAttributes(
          "calendar-year-picker-indicator",
          [s.indicator, provider.open() && s.openIndicator],
          { "aria-hidden": "true", ...attrs },
        ),
        slots["default"]?.() ?? "›",
      );
  },
}) as unknown as HtmlPart<"span">;
const Trigger: StyledPart<typeof CollapsibleTrigger> = sdkPart(
  CollapsibleTrigger,
  "calendar-year-picker-trigger",
  () => s.trigger,
);
export type CalendarYearPickerTriggerRenderProps = { isOpen: boolean; monthYear: string };
type ScopedPart<C extends new () => { $slots: object }, Scope> = new () => Omit<
  InstanceType<C>,
  "$slots"
> & {
  $slots: Omit<InstanceType<C>["$slots"], "default"> & { default?: (scope: Scope) => VNodeChild };
};
export const CalendarYearPickerTrigger: ScopedPart<
  typeof Trigger,
  CalendarYearPickerTriggerRenderProps
> = defineComponent({
  name: "LensoCalendarYearPickerTrigger",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const provider = useProvider();
    return () => {
      const monthYear = heading(provider);
      return h(
        Trigger,
        mergeProps(
          { "aria-label": monthYear + ", year selector", ...attrs },
          {
            onKeydown(event: KeyboardEvent) {
              if (!event.defaultPrevented && event.key === "Escape" && provider.open()) {
                event.preventDefault();
                provider.close();
              }
            },
          },
        ),
        {
          ...slots,
          default: slots["default"]
            ? () => slots["default"]?.({ isOpen: provider.open(), monthYear })
            : () => [h(CalendarYearPickerTriggerHeading), h(CalendarYearPickerTriggerIndicator)],
        },
      );
    };
  },
}) as unknown as ScopedPart<typeof Trigger, CalendarYearPickerTriggerRenderProps>;

type GridModel = {
  years: () => number[];
  format: (value: number) => string;
  current: () => number;
  handle: PrimitiveHandle<typeof yearPicker>;
  select: (year: number, event?: Event) => void;
};
const GridContext: InjectionKey<GridModel> = Symbol("YearPickerGrid");
function useGrid() {
  const model = inject(GridContext, undefined);
  if (!model) throw new Error("Year picker cells require CalendarYearPicker.Grid");
  return model;
}
const Cell: StyledPart<typeof Button> = sdkPart(
  Button,
  "calendar-year-picker-year-cell",
  () => s.cell,
);
export type CalendarYearPickerCellRenderProps = {
  year: number;
  formattedYear: string;
  isSelected: boolean;
  isCurrentYear: boolean;
  isOpen: boolean;
  selectYear: () => void;
};
type YearCell = ScopedPart<
  StyledPart<typeof Button, { year: number }>,
  CalendarYearPickerCellRenderProps
>;
export const CalendarYearPickerCell: YearCell = defineComponent({
  name: "LensoCalendarYearPickerCell",
  inheritAttrs: false,
  props: {
    year: { type: Number, required: true },
    disabled: Boolean,
    onClick: Function as PropType<ComponentProps<typeof Cell>["onClick"]>,
  },
  setup(props, { attrs, slots }) {
    const grid = useGrid();
    const provider = useProvider();
    const node = shallowRef<HTMLElement>();
    watchPostEffect((cleanup) => {
      if (node.value) cleanup(grid.handle.api.bind(node.value, String(props.year), props.disabled));
    });
    return () => {
      const selected = grid.current() === props.year;
      return h(
        Cell,
        {
          "aria-label": grid.format(props.year),
          ...attrs,
          disabled: props.disabled,
          "data-year": props.year,
          "aria-pressed": String(selected) as "true" | "false",
          tabindex: provider.open() && selected ? 0 : -1,
          xstyle: [selected && s.selected, attrs["xstyle"] as StyleXArgument],
          onVnodeMounted({ el }: VNode) {
            if (el instanceof HTMLElement) node.value = el;
          },
          onVnodeUpdated({ el }: VNode) {
            if (el instanceof HTMLElement) node.value = el;
          },
          onClick(event: MouseEvent, details: ButtonActionDetails) {
            const result = props.onClick?.(event, details);
            if (!event.defaultPrevented) grid.select(props.year, event);
            return result;
          },
        },
        {
          ...slots,
          default: slots["default"]
            ? () =>
                slots["default"]?.({
                  year: props.year,
                  formattedYear: grid.format(props.year),
                  isSelected: selected,
                  isCurrentYear: props.year === new Date().getFullYear(),
                  isOpen: provider.open(),
                  selectYear: () => {
                    if (!props.disabled) grid.select(props.year);
                  },
                })
            : () => grid.format(props.year),
        },
      );
    };
  },
}) as unknown as YearCell;

export const CalendarYearPickerGridBody = defineComponent({
  name: "LensoCalendarYearPickerGridBody",
  slots: Object as SlotsType<{ default?: (scope: { year: number }) => VNodeChild }>,
  setup(_, { slots }) {
    const grid = useGrid();
    return () =>
      grid
        .years()
        .map((year) =>
          slots.default
            ? h(YearEntry, { key: year, year }, { default: slots.default })
            : h(CalendarYearPickerCell, { key: year, year }),
        );
  },
});
const YearEntry = defineComponent({
  props: { year: { type: Number, required: true } },
  setup(props, { slots }) {
    return () => slots["default"]?.({ year: props.year });
  },
});

type Change = (year: number, details: ChangeDetails<ModelChangeReason>) => void;
const Grid = defineComponent({
  name: "LensoCalendarYearPickerGrid",
  inheritAttrs: false,
  props: {
    visibleYears: Number,
    controller: Object as PropType<ModelController>,
    onValueChange: Function as PropType<Change>,
    onKeydown: Function as PropType<(event: KeyboardEvent) => void>,
  },
  setup(props, { attrs, slots }) {
    const provider = useProvider();
    const state = provider.state;
    const current = () => Number(state().month.slice(0, 4));
    const years = computed(() => {
      const min = Number(provider.min()?.slice(0, 4) ?? 1);
      const max = Number(provider.max()?.slice(0, 4) ?? 9999);
      const count = Math.min(
        max - min + 1,
        Math.max(
          1,
          Math.trunc(props.visibleYears ?? (provider.min() && provider.max() ? max - min + 1 : 20)),
        ),
      );
      const first = Math.min(max - count + 1, Math.max(min, current() - Math.floor(count / 2)));
      return Array.from({ length: count }, (_, index) => first + index);
    });
    const format = (year: number) =>
      new Intl.DateTimeFormat(provider.locale(), { year: "numeric", timeZone: "UTC" }).format(
        date(year),
      );
    const handle = usePrimitive(yearPicker, () => ({
      value: String(current()),
      controller: props.controller,
      disabled: state().disabled,
      validate: (value) => provider.open() && years.value.includes(Number(value)),
      onValueChange(value, details) {
        const year = Number(value);
        props.onValueChange?.(year, details);
        if (details.canceled) return;
        let month = String(year).padStart(4, "0") + state().month.slice(4);
        const min = provider.min()?.slice(0, 7);
        const max = provider.max()?.slice(0, 7);
        if (min && month < min) month = min;
        if (max && month > max) month = max;
        if (
          month !== state().month &&
          !provider.calendar().setMonth(month, { reason: "select-change", event: details.event })
        ) {
          details.cancel();
          return;
        }
        provider.close();
      },
      move(event, from) {
        const rtl = event.target instanceof HTMLElement && isRTL(event.target);
        const step = (
          {
            ArrowLeft: rtl ? 1 : -1,
            ArrowRight: rtl ? -1 : 1,
            ArrowUp: -3,
            ArrowDown: 3,
          } as Record<string, number>
        )[event.key];
        const list = years.value;
        const index =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? list.length - 1
              : step === undefined
                ? -1
                : Math.max(0, Math.min(list.length - 1, list.indexOf(Number(from)) + step));
        return list[index] === undefined ? undefined : String(list[index]);
      },
    }));
    provide(GridContext, {
      handle,
      current,
      years: () => years.value,
      format,
      select(year, event) {
        if (current() === year) provider.close();
        else handle.api.setValue(String(year), { reason: "item-press", event });
      },
    });
    const grid = shallowRef<HTMLElement>();
    watchPostEffect((cleanup) => {
      const node = grid.value;
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
      cleanup(() => observer.disconnect());
    });
    watch(
      [provider.open, grid],
      ([open, node]) => {
        if (open && node)
          void nextTick(() => {
            if (provider.open()) handle.api.focus(String(current()));
          });
      },
      { flush: "post" },
    );
    const renderGrid = usePart(
      handle,
      "root",
      undefined,
      () => ({
        ...partAttributes("calendar-year-picker-grid", s.grid, {
          role: "group",
          "aria-label": "Years",
          ...attrs,
        }),
        onVnodeMounted({ el }: VNode) {
          if (el instanceof HTMLElement) grid.value = el;
        },
        onVnodeBeforeUnmount() {
          grid.value = undefined;
        },
        onKeydown(event: KeyboardEvent) {
          props.onKeydown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Escape") {
            event.preventDefault();
            provider.close();
          } else handle.api.navigate(event);
        },
      }),
      {
        tag: "div",
        children: () => slots["default"]?.() ?? h(CalendarYearPickerGridBody),
      },
    );
    return () =>
      h(
        CollapsiblePanel,
        { style: { display: "contents" } },
        {
          default: () => renderGrid(),
        },
      );
  },
});
export const CalendarYearPickerGrid: StyledPart<typeof Grid, HTMLAttributes> =
  Grid as unknown as StyledPart<typeof Grid, HTMLAttributes>;

export function useYearPicker() {
  const provider = useProvider();
  return {
    controller: provider.disclosure,
    get isYearPickerOpen() {
      return provider.open();
    },
    setIsYearPickerOpen: provider.disclosure.setOpen,
  };
}
export function useCalendarOrRangeState() {
  return useProvider().state;
}

const YearSelect: StyledPart<typeof CalendarYearSelect> = sdkPart(
  CalendarYearSelect,
  "calendar-year-select",
  () => calendarStyles.navButton,
);
const parts: {
  Trigger: typeof CalendarYearPickerTrigger;
  TriggerHeading: typeof CalendarYearPickerTriggerHeading;
  TriggerIndicator: typeof CalendarYearPickerTriggerIndicator;
  Grid: typeof CalendarYearPickerGrid;
  GridBody: typeof CalendarYearPickerGridBody;
  Cell: typeof CalendarYearPickerCell;
} = {
  Trigger: CalendarYearPickerTrigger,
  TriggerHeading: CalendarYearPickerTriggerHeading,
  TriggerIndicator: CalendarYearPickerTriggerIndicator,
  Grid: CalendarYearPickerGrid,
  GridBody: CalendarYearPickerGridBody,
  Cell: CalendarYearPickerCell,
};

export const CalendarYearPicker: typeof YearSelect & typeof parts = Object.assign(
  YearSelect,
  parts,
);
export { createModelController as createCalendarYearPickerController } from "@lenso/primitives/model-control";
export type {
  ModelController as CalendarYearPickerController,
  ModelChangeReason as CalendarYearPickerChangeReason,
} from "@lenso/primitives/model-control";
export type CalendarYearPickerGridProps = ComponentProps<typeof CalendarYearPickerGrid>;
export type CalendarYearPickerCellProps = ComponentProps<typeof CalendarYearPickerCell>;
