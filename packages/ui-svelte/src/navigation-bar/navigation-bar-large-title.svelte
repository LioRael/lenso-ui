<script lang="ts">
  import { navigationBarStyles } from "@lenso/tokens/navigation-bar";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["h1"] & StyleXProps = $props();
  const presentation = $derived(styled(navigationBarStyles.largeTitle, xstyle, className, style));
</script>

<h1 data-lenso-slot="navigation-bar-large-title" {...rest} {...presentation}>
  {@render children?.()}
</h1>
