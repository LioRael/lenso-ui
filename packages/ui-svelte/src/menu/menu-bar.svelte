<script lang="ts">
  import { menuStyles } from "@lenso/tokens/menu";
  import { styled, type StyleXProps } from "../styled.js";
  import type { SvelteHTMLElements } from "svelte/elements";
  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(menuStyles.bar, xstyle, className, style));
</script>

<div data-lenso-slot="menu-bar" {...rest} {...presentation}>{@render children?.()}</div>
