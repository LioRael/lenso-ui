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
  }: SvelteHTMLElements["h3"] & StyleXProps = $props();
  const presentation = $derived(styled(disclosureStyles.heading, xstyle, className, style));
</script>

<h3 data-lenso-slot="disclosure-heading" {...rest} {...presentation}>
  {@render children?.()}
</h3>
