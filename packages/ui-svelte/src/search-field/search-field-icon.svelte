<script lang="ts">
  import { IconSearch } from "../icons/index.js";
  import { searchFieldStyles } from "@lenso/tokens/search-field";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(searchFieldStyles.icon, xstyle, className, style));
</script>

<span data-lenso-slot="search-field-icon" {...rest} {...presentation}>
  {#if children}{@render children()}{:else}<IconSearch />{/if}
</span>
