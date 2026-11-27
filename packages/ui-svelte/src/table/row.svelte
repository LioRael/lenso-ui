<script module lang="ts">
  export type TableRowProps = SvelteHTMLElements["tr"] &
    StyleXProps & {
      itemKey?: TableKey;
      disabled?: boolean;
      childRows?: Snippet;
      expandedContent?: Snippet;
      expandedColSpan?: number;
    };
</script>

<script lang="ts">
  import type { TableKey } from "@lenso/primitives/table/core";
  import { tableStyles as s } from "@lenso/tokens/table";
  import type { Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  import TreeRows from "./tree-rows.svelte";
  import { getDepth, getTable, getWindowRow, hasControl, setRow } from "./context.js";

  let {
    itemKey,
    disabled,
    childRows,
    expandedContent,
    expandedColSpan = 1,
    xstyle,
    class: className,
    style,
    children,
    onclick,
    onkeydown,
    ondragstart,
    ondragover,
    ondrop,
    ondragend,
    draggable,
    ...rest
  }: TableRowProps = $props();
  const table = getTable();
  const getParentDepth = getDepth();
  const depth = $derived(getParentDepth?.() ?? 0);
  const window = getWindowRow();
  const windowRow = $derived(window?.());
  let node: HTMLTableRowElement | undefined = $state();
  const inactive = $derived(
    Boolean(disabled || (itemKey !== undefined && table?.disabled(itemKey))),
  );
  const expanded = $derived(itemKey !== undefined && Boolean(table?.expanded().has(itemKey)));
  const selected = $derived(itemKey !== undefined && Boolean(table?.selected().has(itemKey)));
  setRow({
    key: () => itemKey,
    disabled: () => inactive,
    expanded: () => expanded,
    depth: () => depth,
    hasChildItems: () => Boolean(childRows),
  });
  $effect(() => {
    if (node && itemKey !== undefined) return table?.registerRow(itemKey, node, () => inactive);
  });
  const presentation = $derived(
    styled(
      [s.row, inactive && s.disabled],
      xstyle,
      className,
      windowRow ? [style, `height:${windowRow.height}px`].filter(Boolean).join(";") : style,
    ),
  );
</script>

<tr
  data-lenso-slot="table-row"
  {...rest}
  {...presentation}
  bind:this={node}
  aria-disabled={inactive ? true : rest["aria-disabled"]}
  aria-selected={itemKey !== undefined && table && table.mode() !== "none"
    ? selected
    : rest["aria-selected"]}
  aria-expanded={expandedContent || childRows ? expanded : rest["aria-expanded"]}
  aria-level={table?.treeColumn() !== undefined && itemKey !== undefined
    ? depth + 1
    : rest["aria-level"]}
  aria-rowindex={rest["aria-rowindex"] ?? (windowRow ? windowRow.index + 2 : undefined)}
  data-window-index={windowRow?.index}
  draggable={!inactive && (draggable ?? (itemKey !== undefined && table?.drag.enabled()))}
  ondragstart={(event) => {
    ondragstart?.(event);
    if (!event.defaultPrevented && itemKey !== undefined) table?.drag.start(event, itemKey);
  }}
  ondragover={(event) => {
    ondragover?.(event);
    if (!event.defaultPrevented && itemKey !== undefined) table?.drag.over(event, itemKey);
  }}
  ondrop={(event) => {
    ondrop?.(event);
    if (!event.defaultPrevented && itemKey !== undefined)
      table?.drag.drop(event, itemKey, event.currentTarget);
  }}
  ondragend={(event) => {
    ondragend?.(event);
    table?.drag.end();
  }}
  onclick={(event) => {
    onclick?.(event);
    if (
      !event.defaultPrevented &&
      !inactive &&
      itemKey !== undefined &&
      !hasControl(event.target)
    ) {
      table?.select(itemKey, event.shiftKey);
    }
  }}
  onkeydown={(event) => {
    onkeydown?.(event);
    if (!event.defaultPrevented && itemKey !== undefined && table?.drag.keyDown(event, itemKey))
      return;
    if (
      event.defaultPrevented ||
      inactive ||
      itemKey === undefined ||
      !table ||
      table.mode() === "none" ||
      hasControl(event.target)
    )
      return;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      table.select(itemKey);
    }
  }}
>
  {@render children?.()}
</tr>
{#if expanded && childRows}
  <TreeRows depth={depth + 1} children={childRows} />
{/if}
{#if expanded && expandedContent}
  <tr data-lenso-slot="table-expanded-row">
    <td colspan={expandedColSpan}>{@render expandedContent()}</td>
  </tr>
{/if}
