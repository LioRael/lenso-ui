<script lang="ts">
  import { disclosureStyles } from "@lenso/tokens/disclosure";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(disclosureStyles.indicator, xstyle, className, style));
</script>

<span data-lenso-slot="disclosure-indicator" {...rest} {...presentation}>
  {@render children?.()}
</span>
