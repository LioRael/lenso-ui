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
  }: SvelteHTMLElements["p"] & StyleXProps = $props();
  const presentation = $derived(styled(cardStyles.description, xstyle, className, style));
</script>

<p data-lenso-slot="card-description" {...rest} {...presentation}>
  {@render children?.()}
</p>
