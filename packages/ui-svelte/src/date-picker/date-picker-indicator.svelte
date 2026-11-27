<script lang="ts">
  import { datePickerStyles } from "@lenso/tokens/date-picker";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(datePickerStyles.indicator, xstyle, className, style));
</script>

<span data-lenso-slot="date-picker-indicator" {...rest} {...presentation}>
  {@render children?.()}
</span>
