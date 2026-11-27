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
  }: SvelteHTMLElements["header"] & StyleXProps = $props();
  const presentation = $derived(styled(sidebarStyles.header, xstyle, className, style));
</script>

<header data-lenso-slot="sidebar-header" {...rest} {...presentation}>
  {@render children?.()}
</header>
