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
  }: SvelteHTMLElements["nav"] & StyleXProps = $props();
  const presentation = $derived(styled(sidebarStyles.content, xstyle, className, style));
</script>

<nav data-lenso-slot="sidebar-content" {...rest} {...presentation}>
  {@render children?.()}
</nav>
