<script lang="ts">
  import { paginationStyles } from "@lenso/tokens/pagination";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["li"] & StyleXProps = $props();
  const presentation = $derived(styled(paginationStyles.item, xstyle, className, style));
</script>

<li data-lenso-slot="pagination-item" {...rest} {...presentation}>
  {@render children?.()}
</li>
