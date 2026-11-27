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
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(disclosureStyles.body, xstyle, className, style));
</script>

<div data-lenso-slot="disclosure-body" {...rest} {...presentation}>
  {@render children?.()}
</div>
