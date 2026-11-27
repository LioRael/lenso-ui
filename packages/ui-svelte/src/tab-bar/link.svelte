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
  }: SvelteHTMLElements["a"] & StyleXProps = $props();
  const presentation = $derived(styled(s.item, xstyle, className, style));
</script>

<a data-lenso-slot="tab-bar-link" {...rest} {...presentation}>
  {@render children?.()}
</a>
