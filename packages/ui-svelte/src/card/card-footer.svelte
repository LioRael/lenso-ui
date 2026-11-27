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
  const presentation = $derived(styled(cardStyles.footer, xstyle, className, style));
</script>

<div data-lenso-slot="card-footer" {...rest} {...presentation}>
  {@render children?.()}
</div>
