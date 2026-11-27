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
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(navigationBarStyles.backIcon, xstyle, className, style));
</script>

<span data-lenso-slot="navigation-bar-back-icon" {...rest} {...presentation}>
  {@render children?.()}
</span>
