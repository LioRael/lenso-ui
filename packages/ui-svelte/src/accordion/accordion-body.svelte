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
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(accordionStyles.body, xstyle, className, style));
</script>

<div data-lenso-slot="accordion-body" {...rest} {...presentation}>
  {@render children?.()}
</div>
