<!-- Copyright NextUI Inc. Apache-2.0. Modified for Svelte. -->
<script module lang="ts">
  export type CalendarYearPickerGridProps = PartProps<"div", ModelState> &
    StyleXProps & {
      format?: Pick<Intl.DateTimeFormatOptions, "year" | "era">;
      visibleYears?: number;
      controller?: ModelController;
      onValueChange?: (year: number, details: ChangeDetails<ModelChangeReason>) => void;
    };
  type ModelState = ReturnType<typeof yearPicker>["types"]["state"];
</script>

<script lang="ts">
  import {
    yearPicker,
    type ModelChangeReason,
    type ModelController,
  } from "@lenso/primitives/model-control";
  import { calendarYearPickerStyles as s } from "@lenso/tokens/calendar-year-picker";
  import { isRTL, sourceOf, type ChangeDetails, type ChangeSource } from "@ui-sdk/core";
  import { withSource } from "@ui-sdk/core/observe";
  import { CollapsiblePanel } from "@ui-sdk/svelte/collapsible";
  import { Part, usePart, usePrimitive, type PartProps } from "@ui-sdk/svelte/primitive";
  import { onMount, tick } from "svelte";
  import { createAttachmentKey } from "svelte/attachments";
  import { styled, type StyleXProps } from "../styled.js";
  import { getYearPicker, setYearGrid, yearDate } from "./context.js";
  import GridBody from "./grid-body.svelte";

  let {
    format,
    visibleYears,
    controller,
    onValueChange,
    xstyle,
    class: className,
    style,
    children: content,
    onkeydown,
    ...rest
  }: CalendarYearPickerGridProps = $props();
  const picker = getYearPicker();
  if (!picker) throw new Error("CalendarYearPicker.Grid requires Calendar or RangeCalendar");
  const calendar = picker;
  const opened = $derived(calendar.open());
  const disabled = $derived(calendar.state().disabled);
  const selected = $derived(Number(calendar.state().month.slice(0, 4)));
  const bounds = $derived(calendar.bounds());
  const years = $derived.by(() => {
    const min = bounds.min ? Number(bounds.min.slice(0, 4)) : 1;
    const max = bounds.max ? Number(bounds.max.slice(0, 4)) : 9999;
    const requested = visibleYears ?? (bounds.min && bounds.max ? max - min + 1 : 20);
    const count = Math.min(
      max - min + 1,
      Math.max(1, Number.isFinite(requested) ? Math.trunc(requested) : 20),
    );
    const start = Math.min(Math.max(min, selected - Math.floor(count / 2)), max - count + 1);
    const formatter = new Intl.DateTimeFormat(calendar.locale() ?? "en", {
      year: "numeric",
      ...format,
      timeZone: "UTC",
    });
    return Array.from({ length: count }, (_, index) => {
      const year = start + index;
      return { year, formatted: formatter.format(yearDate(year)) };
    });
  });
  const close = (source: ChangeSource) => {
    withSource(source, () => {
      if (calendar.disclosure.setOpen(false)) calendar.disclosure.focus();
    });
  };
  const id = $props.id();
  const model = usePrimitive(yearPicker, () => ({
    id,
    value: String(selected),
    disabled,
    controller,
    validate: (value) => opened && years.some(({ year }) => String(year) === value),
    onValueChange(value, details) {
      const year = Number(value);
      onValueChange?.(year, details);
      if (details.canceled) return;
      let month = `${String(year).padStart(4, "0")}${calendar.state().month.slice(4)}`;
      if (bounds.min && month < bounds.min.slice(0, 7)) month = bounds.min.slice(0, 7);
      if (bounds.max && month > bounds.max.slice(0, 7)) month = bounds.max.slice(0, 7);
      if (
        month !== calendar.state().month &&
        !withSource(details.source, () =>
          calendar
            .calendar()
            .setMonth(month, {
              reason: "select-change",
              ...(details.event ? { event: details.event } : {}),
            }),
        )
      ) {
        details.cancel();
        return;
      }
      close(details.source);
    },
    move(event, from) {
      const index = years.findIndex(({ year }) => String(year) === from);
      const rtl = event.target instanceof HTMLElement && isRTL(event.target);
      const steps: Record<string, number> = {
        ArrowRight: rtl ? -1 : 1,
        ArrowLeft: rtl ? 1 : -1,
        ArrowDown: 3,
        ArrowUp: -3,
      };
      const step = steps[event.key];
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? years.length - 1
            : step === undefined
              ? -1
              : Math.max(0, Math.min(years.length - 1, index + step));
      return years[next] ? String(years[next].year) : undefined;
    },
  }));
  const root = usePart(model, "root");
  let current = $state.raw(model.instance.get());
  $effect(() => {
    const update = () => {
      current = model.instance.get();
    };
    update();
    return model.instance.subscribe(update);
  });
  let geometry = $state({ top: 0, height: 0 });
  const gridRef = {
    [createAttachmentKey()](node: HTMLElement) {
      const dayGrid = node
        .closest('[data-lenso-slot="calendar"]')
        ?.querySelector<HTMLElement>('[data-lenso-slot="calendar-grid"]');
      if (!dayGrid) return;
      const measure = () => {
        geometry = { top: dayGrid.offsetTop, height: dayGrid.offsetHeight };
      };
      measure();
      const resize = new ResizeObserver(measure);
      resize.observe(dayGrid);
      return () => resize.disconnect();
    },
  };
  $effect(() => {
    if (!opened || disabled) return;
    const key = String(selected);
    let active = true;
    void tick().then(() => {
      if (active) model.api.focus(key);
    });
    return () => {
      active = false;
    };
  });
  onMount(calendar.mountGrid);
  const presentation = $derived(
    styled(
      [s.grid, !opened && s.hidden],
      xstyle,
      className,
      geometry.height ? `top:${geometry.top}px;height:${geometry.height}px;${style ?? ""}` : style,
    ),
  );
  setYearGrid({
    items: () => years,
    selected: () => selected,
    model,
    state: () => current,
    open: () => opened,
    disabled: () => disabled,
    select(year, event) {
      if (!opened || disabled) return;
      if (year === selected) close(sourceOf(event));
      else model.api.setValue(String(year), { reason: "item-press", ...(event ? { event } : {}) });
    },
  });
</script>

{#snippet body(state: ModelState)}
  {#if content}{@render content(state)}{:else}<GridBody />{/if}
{/snippet}

<CollapsiblePanel keepMounted>
  {#if root.present}
    <Part
      tag="div"
      part={root}
      props={{
        ...gridRef,
        "aria-label": "Years",
        "data-lenso-slot": "calendar-year-picker-grid",
        ...rest,
        ...presentation,
        "aria-hidden": !opened,
        inert: !opened,
        children: body,
        onkeydown(event: KeyboardEvent & { currentTarget: HTMLDivElement }) {
          onkeydown?.(event);
          if (!opened || event.defaultPrevented) return;
          if (event.key === "Escape") {
            event.preventDefault();
            close("keyboard");
          } else model.api.navigate(event);
        },
      }}
    />
  {/if}
</CollapsiblePanel>
