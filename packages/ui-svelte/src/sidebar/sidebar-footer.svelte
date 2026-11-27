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
  }: SvelteHTMLElements["footer"] & StyleXProps = $props();
  const presentation = $derived(styled(sidebarStyles.footer, xstyle, className, style));
</script>

<footer data-lenso-slot="sidebar-footer" {...rest} {...presentation}>
  {@render children?.()}
</footer>
