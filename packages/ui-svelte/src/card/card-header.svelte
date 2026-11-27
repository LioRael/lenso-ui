<script lang="ts">
  import { cardStyles } from "@lenso/tokens/card";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(cardStyles.header, xstyle, className, style));
</script>

<div data-lenso-slot="card-header" {...rest} {...presentation}>
  {@render children?.()}
</div>
