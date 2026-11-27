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
  }: SvelteHTMLElements["nav"] & StyleXProps = $props();
  const presentation = $derived(styled(paginationStyles.root, xstyle, className, style));
</script>

<nav data-lenso-slot="pagination" {...rest} {...presentation}>
  {@render children?.()}
</nav>
