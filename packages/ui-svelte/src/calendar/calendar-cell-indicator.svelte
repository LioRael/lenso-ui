<script lang="ts">
  import { calendarStyles } from "@lenso/tokens/calendar";
  import { styled, type StyleXProps } from "../styled.js";
  import type { SvelteHTMLElements } from "svelte/elements";
  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled([calendarStyles.indicator,calendarStyles.nativeIndicator], xstyle, className, style));
</script>

<span aria-hidden="true" data-lenso-slot="calendar-cell-indicator" {...rest} {...presentation}>
  {@render children?.()}
</span>
