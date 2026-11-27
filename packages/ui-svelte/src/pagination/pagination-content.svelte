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
  }: SvelteHTMLElements["ul"] & StyleXProps = $props();
  const presentation = $derived(styled(paginationStyles.content, xstyle, className, style));
</script>

<ul data-lenso-slot="pagination-content" {...rest} {...presentation}>
  {@render children?.()}
</ul>
