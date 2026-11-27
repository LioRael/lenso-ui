<script lang="ts" generics="Item extends { key: TableKey }">
  import type { TableKey } from "@lenso/primitives/table/core";
  import type { Snippet } from "svelte";

  let { items, children }: { items: readonly Item[]; children: Snippet<[Item]> } = $props();
</script>

{#each items as item (item.key)}
  {@render children(item)}
{/each}
