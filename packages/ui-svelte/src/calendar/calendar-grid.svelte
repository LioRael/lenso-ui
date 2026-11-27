<script lang="ts">
  import { getYearPicker } from "../calendar-year-picker/context.js";
  import { calendarYearPickerStyles } from "@lenso/tokens/calendar-year-picker";
  import { calendarStyles } from "@lenso/tokens/calendar";
  import type { ComponentProps } from "svelte";
  import { CalendarGrid as Part } from "@ui-sdk/svelte/calendar";
  import { styled, type StyleXProps } from "../styled.js";

  import Weekdays from "./calendar-weekdays.svelte";
  import Weekday from "./calendar-weekday.svelte";
  import Weeks from "./calendar-weeks.svelte";
  import Day from "./calendar-day.svelte";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { children: content,xstyle, class: className, style, ...rest }: Props = $props();
  const picker = getYearPicker();
  const hidden = $derived(Boolean(picker?.open() && picker.ready()));
  const presentation = $derived(
    styled(
      [calendarStyles.nativeGrid, hidden && calendarYearPickerStyles.dayGridHidden],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part
  aria-hidden={hidden || undefined}
  inert={hidden || undefined}
  data-lenso-slot="calendar-grid"
  {...rest}
  {...presentation}
>
  {#snippet children(state)}
    {#if content}{@render content(state)}{:else}
      <Weekdays>{#snippet children(index)}<Weekday {index}/>{/snippet}</Weekdays>
      <Weeks>{#snippet children(cell)}<Day value={cell.date}/>{/snippet}</Weeks>
    {/if}
  {/snippet}
</Part>
