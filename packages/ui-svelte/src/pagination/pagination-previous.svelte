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
  }: SvelteHTMLElements["a"] & StyleXProps = $props();
  const presentation = $derived(styled(paginationStyles.link, xstyle, className, style));
</script>

<a data-lenso-slot="pagination-previous" {...rest} {...presentation}>
  {@render children?.()}
</a>
