<script lang="ts">
  import { tableStyles as s } from "@lenso/tokens/table";
  import type { Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import type { SortDescriptor } from "./state.svelte.js";

  let {
    sortDirection,
    showIndicator = true,
    indicator,
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["span"] &
    StyleXProps & {
      sortDirection?: SortDescriptor["direction"];
      showIndicator?: boolean;
      indicator?: Snippet;
    } = $props();
  const presentation = $derived(styled(s.sortableColumnHeader, xstyle, className, style));
</script>

<span data-lenso-slot="table-sortable-column-header" {...rest} {...presentation}>
  {@render children?.()}
  {#if sortDirection && showIndicator}
    <span
      aria-hidden="true"
      data-direction={sortDirection}
      {...attributes(s.sortableColumnIndicator, sortDirection === "descending" && s.descending)}
    >
      {#if indicator}
        {@render indicator()}
      {:else}
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
          <path
            d="m4 10 4-4 4 4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      {/if}
    </span>
  {/if}
</span>
