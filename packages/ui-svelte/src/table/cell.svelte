<script lang="ts">
  import { tableStyles as s } from "@lenso/tokens/table";
  import type { TableKey } from "@lenso/primitives/table/core";
  import type { Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  import { getTable, getRow, getVariant } from "./context.js";

  let {
    columnKey,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["td"], "children"> &
    StyleXProps & {
      columnKey?: TableKey;
      children?: Snippet<
        [
          {
            hasChildItems: boolean;
            isExpanded: boolean;
            isDisabled: boolean;
            isTreeColumn: boolean;
          },
        ]
      >;
    } = $props();
  const table = getTable();
  const row = getRow();
  const variant = getVariant();
  const key = $derived(row?.key());
  const isTreeColumn = $derived(columnKey !== undefined && table?.treeColumn() === columnKey);
  const selected = $derived(key !== undefined && table?.selected().has(key));
  const presentation = $derived(
    styled(
      [
        s.cell,
        variant?.() === "secondary" && s.secondaryCell,
        selected && s.selectedCell,
        isTreeColumn && s.treeDepth(row?.depth() ?? 0),
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<td
  data-lenso-slot="table-cell"
  tabindex={key === undefined ? undefined : row?.disabled() ? -1 : 0}
  role={table?.treeColumn() === undefined ? undefined : "gridcell"}
  data-tree-column={isTreeColumn ? "" : undefined}
  {...rest}
  {...presentation}
>
  {@render children?.({
    hasChildItems: row?.hasChildItems() ?? false,
    isExpanded: row?.expanded() ?? false,
    isDisabled: row?.disabled() ?? false,
    isTreeColumn,
  })}
</td>
