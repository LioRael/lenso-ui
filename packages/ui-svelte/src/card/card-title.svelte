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
  }: SvelteHTMLElements["h3"] & StyleXProps = $props();
  const presentation = $derived(styled(cardStyles.title, xstyle, className, style));
</script>

<h3 data-lenso-slot="card-title" {...rest} {...presentation}>
  {@render children?.()}
</h3>
