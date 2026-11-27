<script lang="ts">
  import { tableStyles as s } from "@lenso/tokens/table";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(s.loadMoreContent, xstyle, className, style));
</script>

<div data-lenso-slot="table-load-more-content" {...rest} {...presentation}>
  {@render children?.()}
</div>
