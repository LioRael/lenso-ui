<script lang="ts">
  import { popoverStyles } from "@lenso/tokens/popover";
  import { styled, type StyleXProps } from "../styled.js";
  import type { SvelteHTMLElements } from "svelte/elements";
  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["p"] & StyleXProps = $props();
  const presentation = $derived(styled(popoverStyles.description, xstyle, className, style));
</script>

<p data-lenso-slot="date-picker-popover-description" {...rest} {...presentation}>
  {@render children?.()}
</p>
