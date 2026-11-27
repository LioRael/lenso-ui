<script module lang="ts">
  export type TableColumnProps = Omit<SvelteHTMLElements["th"], "children" | "width"> &
    StyleXProps & {
      columnKey?: TableKey;
      allowsSorting?: boolean;
      width?: ColumnWidth;
      minWidth?: number;
      maxWidth?: number;
      children?: Snippet<[{ sortDirection?: SortDescriptor["direction"] }]>;
    };
</script>

<script lang="ts">
  import type { ColumnWidth, TableKey } from "@lenso/primitives/table/core";
  import { tableStyles as s } from "@lenso/tokens/table";
  import type { Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  import { getTable, getVariant, hasControl, setColumn } from "./context.js";
  import type { SortDescriptor } from "./state.svelte.js";

  let {
    columnKey,
    allowsSorting,
    width,
    minWidth,
    maxWidth,
    children,
    onclick,
    onkeydown,
    xstyle,
    class: className,
    style,
    ...rest
  }: TableColumnProps = $props();
  const table = getTable();
  const variant = getVariant();
  let host: HTMLTableCellElement | undefined = $state();
  let measured = $state(160);
  const min = $derived(minWidth ?? 48);
  const max = $derived(maxWidth ?? 2000);
  const sortable = $derived(Boolean(allowsSorting && columnKey !== undefined && table));
  const sortDirection = $derived.by(() => {
    const descriptor = table?.sort();
    return descriptor && descriptor.column === columnKey ? descriptor.direction : undefined;
  });
  const resolved = $derived(columnKey === undefined ? undefined : table?.widths().get(columnKey));
  const cssWidth = $derived.by(() => {
    const value = resolved ?? width;
    return typeof value === "number" ? `${value}px` : value?.endsWith("fr") ? undefined : value;
  });
  setColumn({
    width: () => resolved ?? (typeof width === "number" ? width : measured),
    min: () => min,
    max: () => max,
    resize(value) {
      if (columnKey !== undefined) table?.resize(columnKey, Math.min(max, Math.max(min, value)));
    },
  });
  $effect(() => {
    if (columnKey !== undefined) return table?.registerColumn({ key: columnKey, width, min, max });
  });
  $effect(() => {
    if (!host || !table || columnKey === undefined) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) measured = entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width;
    });
    observer.observe(host);
    return () => observer.disconnect();
  });
  const columnStyle = $derived(
    [
      style,
      cssWidth && `width:${cssWidth}`,
      minWidth !== undefined && `min-width:${minWidth}px`,
      maxWidth !== undefined && `max-width:${maxWidth}px`,
    ]
      .filter(Boolean)
      .join(";"),
  );
  const presentation = $derived(
    styled(
      [
        s.column,
        (sortable || Boolean(rest["aria-sort"])) && s.sortableColumn,
        variant?.() === "secondary" && s.secondaryColumn,
      ],
      xstyle,
      className,
      columnStyle,
    ),
  );

  function sort() {
    if (sortable && columnKey !== undefined) table?.sortBy(columnKey);
  }
</script>

<th
  scope="col"
  tabindex={table && columnKey !== undefined ? 0 : undefined}
  data-lenso-slot="table-column"
  {...rest}
  {...presentation}
  bind:this={host}
  aria-sort={sortable ? (sortDirection ?? "none") : rest["aria-sort"]}
  data-allows-sorting={sortable ? "" : undefined}
  onclick={(event) => {
    onclick?.(event);
    if (!event.defaultPrevented && !hasControl(event.target)) sort();
  }}
  onkeydown={(event) => {
    onkeydown?.(event);
    if (event.defaultPrevented || event.target !== event.currentTarget || !sortable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      sort();
    }
  }}
>
  {@render children?.({ sortDirection })}
</th>
