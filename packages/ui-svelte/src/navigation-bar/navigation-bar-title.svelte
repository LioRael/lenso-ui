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
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(navigationBarStyles.title, xstyle, className, style));
</script>

<div data-lenso-slot="navigation-bar-title" {...rest} {...presentation}>
  {@render children?.()}
</div>
