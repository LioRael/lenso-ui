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
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(paginationStyles.summary, xstyle, className, style));
</script>

<div data-lenso-slot="pagination-summary" {...rest} {...presentation}>
  {@render children?.()}
</div>
