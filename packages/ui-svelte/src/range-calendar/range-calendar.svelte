<script module lang="ts">
  export type RangeCalendarProps = ComponentProps<typeof CalendarRoot> & { mode?: never };
</script>

<script lang="ts">
  import { rangeCalendarStyles } from "@lenso/tokens/range-calendar";
  import type { ComponentProps } from "svelte";
  import { CalendarRoot } from "../calendar/index.js";

  let {
    value = $bindable(),
    month = $bindable(),
    isYearPickerOpen = $bindable(),
    xstyle,
    ...rest
  }: RangeCalendarProps = $props();
</script>

<CalendarRoot
  {...rest}
  mode="range"
  xstyle={[rangeCalendarStyles.root, xstyle]}
  bind:value
  bind:month
  bind:isYearPickerOpen
/>
