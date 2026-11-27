<script lang="ts">
  import { calendarStyles } from "@lenso/tokens/calendar";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(calendarStyles.header, xstyle, className, style));
</script>

<div data-lenso-slot="calendar-header" {...rest} {...presentation}>
  {@render children?.()}
</div>
