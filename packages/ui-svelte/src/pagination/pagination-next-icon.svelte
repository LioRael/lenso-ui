<script lang="ts">
  import { paginationStyles } from "@lenso/tokens/pagination";
  import { styled, type StyleXProps } from "../styled.js";
  import type { SvelteHTMLElements } from "svelte/elements";
  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(paginationStyles.icon, xstyle, className, style));
</script>

<span aria-hidden="true" data-lenso-slot="pagination-next-icon" {...rest} {...presentation}>
  {#if children}{@render children()}{:else}<svg
      viewBox="0 0 16 16"
      width="100%"
      height="100%"
      fill="none"
    >
      <path
        d="m6 4 4 4-4 4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>{/if}
</span>
