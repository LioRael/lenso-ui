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
  }: SvelteHTMLElements["h2"] & StyleXProps = $props();
  const presentation = $derived(styled(popoverStyles.title, xstyle, className, style));
</script>

<h2 data-lenso-slot="date-picker-title" {...rest} {...presentation}>{@render children?.()}</h2>
