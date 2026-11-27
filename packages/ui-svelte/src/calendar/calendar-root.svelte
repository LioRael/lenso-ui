<script lang="ts">
  import { calendarStyles } from "@lenso/tokens/calendar";
  import type { ComponentProps } from "svelte";
  import { Calendar as Part, createCalendarController } from "@ui-sdk/svelte/calendar";
  import YearProvider, { type YearPickerOptions } from "../calendar-year-picker/provider.svelte";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps &
    YearPickerOptions & { selectionMode?: ComponentProps<typeof Part>["mode"] };
  let {
    value = $bindable(),
    selectionMode,
    mode,
    month = $bindable(),
    isYearPickerOpen = $bindable(),
    defaultYearPickerOpen,
    onYearPickerOpenChange,
    children,
    controller,
    xstyle,
    class: className,
    style,
    ...rest
  }: Props = $props();
  const ownController = createCalendarController();
  const calendar = $derived(controller ?? ownController);
  const presentation = $derived(styled(calendarStyles.root, xstyle, className, style));
</script>

{#snippet content(state: import("@ui-sdk/svelte/calendar").CalendarState)}
  <YearProvider
    {state}
    {calendar}
    locale={rest.locale}
    min={rest.min}
    max={rest.max}
    bind:isYearPickerOpen
    {defaultYearPickerOpen}
    {onYearPickerOpenChange}
  >
    {@render children?.(state)}
  </YearProvider>
{/snippet}

<Part
  data-lenso-slot="calendar"
  {...rest}
  {...presentation}
  mode={mode ?? selectionMode}
  controller={calendar}
  children={children ? content : undefined}
  bind:value
  bind:month
/>
