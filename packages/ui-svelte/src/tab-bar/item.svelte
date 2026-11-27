<script lang="ts">
  import { tabBarStyles as s } from "@lenso/tokens/tab-bar";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["li"] & StyleXProps = $props();
  const presentation = $derived(styled(s.itemContainer, xstyle, className, style));
</script>

<li data-lenso-slot="tab-bar-item-container" {...rest} {...presentation}>
  {@render children?.()}
</li>
