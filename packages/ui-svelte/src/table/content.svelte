<script module lang="ts">
  export type TableContentProps = SvelteHTMLElements["table"] & StyleXProps & TableStateProps;
</script>

<script lang="ts">
  import { tableStyles as s } from "@lenso/tokens/table";
  import { isRTL } from "@ui-sdk/core";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import { hasControl, setTable } from "./context.js";
  import { createTableState, type TableStateProps } from "./state.svelte.js";

  let {
    treeColumn,
    dragAndDrop,
    selectionMode,
    selectedKeys,
    defaultSelectedKeys,
    disabledKeys,
    onSelectionChange,
    sortDescriptor,
    defaultSortDescriptor,
    onSortChange,
    expandedKeys,
    defaultExpandedKeys,
    onExpandedChange,
    columnWidths,
    defaultColumnWidths,
    onColumnWidthsChange,
    xstyle,
    class: className,
    style,
    children,
    onkeydown,
    ...rest
  }: TableContentProps = $props();

  let host: HTMLTableElement | undefined = $state();
  let available = $state(0);
  const table = createTableState(
    {
      get treeColumn() {
        return treeColumn;
      },
      get dragAndDrop() {
        return dragAndDrop;
      },
      get selectionMode() {
        return selectionMode;
      },
      get selectedKeys() {
        return selectedKeys;
      },
      get defaultSelectedKeys() {
        return defaultSelectedKeys;
      },
      get disabledKeys() {
        return disabledKeys;
      },
      get onSelectionChange() {
        return onSelectionChange;
      },
      get sortDescriptor() {
        return sortDescriptor;
      },
      get defaultSortDescriptor() {
        return defaultSortDescriptor;
      },
      get onSortChange() {
        return onSortChange;
      },
      get expandedKeys() {
        return expandedKeys;
      },
      get defaultExpandedKeys() {
        return defaultExpandedKeys;
      },
      get onExpandedChange() {
        return onExpandedChange;
      },
      get columnWidths() {
        return columnWidths;
      },
      get defaultColumnWidths() {
        return defaultColumnWidths;
      },
      get onColumnWidthsChange() {
        return onColumnWidthsChange;
      },
    },
    () => available,
  );
  setTable(table);

  $effect(() => {
    const node = host;
    if (!node) return;
    const measure = () => {
      available = Math.max(
        node.parentElement?.clientWidth ?? 0,
        parseFloat(getComputedStyle(node).minWidth) || 0,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node.parentElement ?? node);
    return () => observer.disconnect();
  });
  const presentation = $derived(
    styled(
      s.content,
      xstyle,
      className,
      table.fixedLayout() ? `${style ?? ""};table-layout:fixed` : style,
    ),
  );

  const keydown: NonNullable<TableContentProps["onkeydown"]> = (event) => {
    onkeydown?.(event);
    if (event.defaultPrevented || hasControl(event.target) || !(event.target instanceof Element))
      return;

    const element = event.currentTarget;
    const cell = event.target.closest<HTMLTableCellElement>("td,th");
    if (!cell || cell.closest("table") !== element) return;
    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "a" &&
      table.mode() === "multiple"
    ) {
      event.preventDefault();
      table.selectAll();
      return;
    }

    const row = cell.parentElement as HTMLTableRowElement;
    const rows = [...element.rows].filter(
      (entry) =>
        entry.getAttribute("aria-disabled") !== "true" && !entry.hasAttribute("aria-hidden"),
    );
    const i = rows.indexOf(row);
    const column = cell.cellIndex;
    const rtl = isRTL(element);
    if (treeColumn !== undefined && cell.hasAttribute("data-tree-column")) {
      const expandKey = rtl ? "ArrowLeft" : "ArrowRight";
      const collapseKey = rtl ? "ArrowRight" : "ArrowLeft";
      const key = table.keyForRow(row);
      if (key !== undefined && (event.key === expandKey || event.key === collapseKey)) {
        event.preventDefault();
        const expanded = table.expanded().has(key);
        const level = Number(row.getAttribute("aria-level"));
        if (row.hasAttribute("aria-expanded") && expanded === (event.key === collapseKey)) {
          table.toggleExpanded(key);
        } else if (event.key === expandKey && expanded) {
          const child = rows[i + 1];
          if (child && Number(child.getAttribute("aria-level")) > level)
            child.cells[column]?.focus();
        } else if (event.key === collapseKey) {
          rows
            .slice(0, i)
            .reverse()
            .find((entry) => {
              const parent = Number(entry.getAttribute("aria-level"));
              return parent > 0 && parent < level;
            })
            ?.cells[column]?.focus();
        }
        return;
      }
    }
    let destination: HTMLTableCellElement | undefined;
    if (event.key === "ArrowDown") destination = rows[i + 1]?.cells[column];
    else if (event.key === "ArrowUp") destination = rows[i - 1]?.cells[column];
    else if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) destination = row.cells[column + 1];
    else if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) destination = row.cells[column - 1];
    else if (event.key === "Home") destination = (event.ctrlKey ? rows[0] : row)?.cells[0];
    else if (event.key === "End") {
      const last = event.ctrlKey ? rows.at(-1) : row;
      destination = last?.cells[last.cells.length - 1];
    }
    if (destination) {
      event.preventDefault();
      if (event.shiftKey) {
        const from = table.keyForRow(row);
        const to = table.keyForRow(destination.parentElement as HTMLTableRowElement);
        if (from !== undefined && to !== undefined) table.extendSelection(from, to);
      }
      destination.focus();
    }
  };
</script>

{#if dragAndDrop}
  <span aria-live="polite" {...attributes(s.dragStatus)}>{table.announcement()}</span>
{/if}
<table
  role={treeColumn === undefined ? undefined : "treegrid"}
  aria-multiselectable={(treeColumn !== undefined && selectionMode === "multiple") || undefined}
  aria-rowcount={table.collectionSize() === undefined
    ? undefined
    : table.collectionSize()! + (host?.tHead?.rows.length ?? 1)}
  data-lenso-slot="table-content"
  {...rest}
  {...presentation}
  onkeydown={keydown}
  bind:this={host}
>
  {@render children?.()}
</table>
