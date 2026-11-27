<script lang="ts">
  import { calendarStyles } from "@lenso/tokens/calendar";
  import type { ComponentProps } from "svelte";
  import { CalendarWeeks as Part } from "@ui-sdk/svelte/calendar";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(calendarStyles.dayBody, xstyle, className, style));
</script>

<Part data-lenso-slot="calendar-weeks" {...rest} {...presentation} />
