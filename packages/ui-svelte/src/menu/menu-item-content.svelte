<script lang="ts">

  import { menuItemStyles } from "@lenso/tokens/menu";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(menuItemStyles.content, xstyle, className, style));
</script>

<span data-lenso-slot="menu-item-content" {...rest} {...presentation}>
  {@render children?.()}
</span>
