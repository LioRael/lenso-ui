<script module lang="ts">
  export type DateRangePickerProps = ComponentProps<typeof DatePickerRoot> & { mode?: never };
</script>

<script lang="ts">
  import { dateRangePickerStyles } from "@lenso/tokens/date-range-picker";
  import type { ComponentProps } from "svelte";
  import { DatePickerRoot } from "../date-picker/index.js";

  let {
    value = $bindable(),
    open = $bindable(),
    month = $bindable(),
    xstyle,
    ...rest
  }: DateRangePickerProps = $props();
</script>

<DatePickerRoot
  {...rest}
  mode="range"
  xstyle={[dateRangePickerStyles.root, xstyle]}
  bind:value
  bind:open
  bind:month
/>
