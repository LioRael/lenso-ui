<script lang="ts" generics="Item extends { key: TableKey }">
  import type { TableKey } from "@lenso/primitives/table/core";
  import { tableStyles as s } from "@lenso/tokens/table";
  import type { Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  import Collection from "./collection.svelte";

  let {
    columns,
    column,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["thead"] &
    StyleXProps & { columns?: readonly Item[]; column?: Snippet<[Item]> } = $props();
  const presentation = $derived(styled(s.header, xstyle, className, style));
</script>

<thead data-lenso-slot="table-header" {...rest} {...presentation}>
  {#if columns && column}
    <tr><Collection items={columns} children={column} /></tr>
  {:else}
    {@render children?.()}
  {/if}
</thead>
