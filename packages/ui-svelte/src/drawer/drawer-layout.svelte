<script lang="ts">
  import { drawerStyles } from "@lenso/tokens/drawer";
  import { styled, type StyleXProps } from "../styled.js";
  import type { SvelteHTMLElements } from "svelte/elements";
  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(drawerStyles.content, xstyle, className, style));
</script>

<div data-lenso-slot="drawer-layout" {...rest} {...presentation}>{@render children?.()}</div>
