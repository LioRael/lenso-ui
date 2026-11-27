<script lang="ts">
  import { sidebarStyles } from "@lenso/tokens/sidebar";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["aside"] & StyleXProps = $props();
  const presentation = $derived(styled(sidebarStyles.root, xstyle, className, style));
</script>

<aside data-lenso-slot="sidebar" {...rest} {...presentation}>
  {@render children?.()}
</aside>
