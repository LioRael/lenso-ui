<script lang="ts">
  import { dateRangePickerStyles } from "@lenso/tokens/date-range-picker";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(dateRangePickerStyles.separator, xstyle, className, style));
</script>

<span data-lenso-slot="date-range-picker-separator" {...rest} {...presentation}>
  {@render children?.()}
</span>
