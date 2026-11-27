<script lang="ts">
  import { accordionStyles } from "@lenso/tokens/accordion";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(accordionStyles.indicator, xstyle, className, style));
</script>

<span data-lenso-slot="accordion-indicator" {...rest} {...presentation}>
  {@render children?.()}
</span>
