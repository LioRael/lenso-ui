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
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(sidebarStyles.icon, xstyle, className, style));
</script>

<span data-lenso-slot="sidebar-icon" {...rest} {...presentation}>
  {@render children?.()}
</span>
