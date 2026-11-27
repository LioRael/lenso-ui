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
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(sidebarStyles.disclosureBody, xstyle, className, style));
</script>

<div data-lenso-slot="sidebar-disclosure-body" {...rest} {...presentation}>
  {@render children?.()}
</div>
