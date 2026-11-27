<!-- Copyright NextUI Inc. Apache-2.0. Modified for Svelte. -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { getYearGrid } from "./context.js";
  import Cell, { type CalendarYearPickerCellRenderProps } from "./cell.svelte";

  let { children }: { children?: Snippet<[CalendarYearPickerCellRenderProps]> } = $props();
  const grid = getYearGrid();
  const today = new Date().getFullYear();
</script>

{#each grid?.items() ?? [] as item (item.year)}
  {#if children}
    {@render children({
      year: item.year,
      formattedYear: item.formatted,
      isSelected: item.year === grid?.selected(),
      isCurrentYear: item.year === today,
      isOpen: Boolean(grid?.open()),
      selectYear: () => grid?.select(item.year),
    })}
  {:else}
    <Cell year={item.year} />
  {/if}
{/each}
