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
  }: SvelteHTMLElements["p"] & StyleXProps = $props();
  const presentation = $derived(styled(sidebarStyles.label, xstyle, className, style));
</script>

<p data-lenso-slot="sidebar-label" {...rest} {...presentation}>
  {@render children?.()}
</p>
