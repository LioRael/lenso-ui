<script lang="ts">
  import { tabsStyles } from "@lenso/tokens/tabs";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(tabsStyles.separator, xstyle, className, style));
</script>

<span data-lenso-slot="tabs-separator" {...rest} {...presentation}>
  {@render children?.()}
</span>
