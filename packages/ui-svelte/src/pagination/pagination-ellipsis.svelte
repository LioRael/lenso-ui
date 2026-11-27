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
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(paginationStyles.ellipsis, xstyle, className, style));
</script>

<span data-lenso-slot="pagination-ellipsis" {...rest} {...presentation}>
  {@render children?.()}
</span>
