<script lang="ts">
  import { searchFieldGroupStyles } from "@lenso/tokens/search-field";
  import { styled, type StyleXProps } from "../styled.js";
  import type { SvelteHTMLElements } from "svelte/elements";
  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(searchFieldGroupStyles.root, xstyle, className, style));
</script>

<div data-lenso-slot="search-field-group" {...rest} {...presentation}>{@render children?.()}</div>
