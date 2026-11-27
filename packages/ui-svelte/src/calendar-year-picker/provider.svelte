<!-- Copyright NextUI Inc. Apache-2.0. Modified for Svelte. -->
<script module lang="ts">
  export type YearPickerOptions = {
    isYearPickerOpen?: boolean;
    defaultYearPickerOpen?: boolean;
    onYearPickerOpenChange?: ComponentProps<typeof Collapsible>["onOpenChange"];
  };
</script>

<script lang="ts">
  import { setYearPicker } from "./context.js";
  import { calendarYearPickerStyles as s } from "@lenso/tokens/calendar-year-picker";
  import type { CalendarController, CalendarState } from "@ui-sdk/svelte/calendar";
  import { Collapsible, createCollapsibleController } from "@ui-sdk/svelte/collapsible";
  import type { ComponentProps, Snippet } from "svelte";
  import { attributes } from "../styled.js";

  let {
    isYearPickerOpen = $bindable(),
    defaultYearPickerOpen,
    onYearPickerOpenChange,
    state: calendarState,
    calendar,
    locale,
    min,
    max,
    children,
  }: YearPickerOptions & {
    state: CalendarState;
    calendar: CalendarController;
    locale?: string;
    min?: string;
    max?: string;
    children: Snippet;
  } = $props();

  const disclosure = createCollapsibleController();
  let grids = $state(0);
  setYearPicker({
    state: () => calendarState,
    open: () => isYearPickerOpen ?? defaultYearPickerOpen ?? false,
    ready: () => grids > 0,
    locale: () => locale,
    bounds: () => ({ min, max }),
    calendar: () => calendar,
    disclosure,
    mountGrid() {
      grids += 1;
      return () => {
        grids -= 1;
      };
    },
  });
</script>

<Collapsible
  {...attributes(s.provider)}
  disabled={calendarState.disabled}
  controller={disclosure}
  defaultOpen={defaultYearPickerOpen}
  onOpenChange={onYearPickerOpenChange}
  bind:open={isYearPickerOpen}
>
  {@render children()}
</Collapsible>
