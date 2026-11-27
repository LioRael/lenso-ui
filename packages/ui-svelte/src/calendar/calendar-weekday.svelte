<script lang="ts">
  import { calendarStyles } from "@lenso/tokens/calendar";
  import type { ComponentProps } from "svelte";
  import { CalendarWeekday as Part } from "@ui-sdk/svelte/calendar";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(calendarStyles.headerCell, xstyle, className, style));
</script>

<Part data-lenso-slot="calendar-weekday" {...rest} {...presentation} />
