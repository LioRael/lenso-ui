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
  }: SvelteHTMLElements["section"] & StyleXProps = $props();
  const presentation = $derived(styled(sidebarStyles.group, xstyle, className, style));
</script>

<section data-lenso-slot="sidebar-group" {...rest} {...presentation}>
  {@render children?.()}
</section>
