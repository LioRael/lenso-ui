<script lang="ts" generics="Item extends { key: TableKey; disabled?: boolean }">
  import {
    collectionWindow,
    revealWindowRow,
    type TableKey,
    type WindowOptions,
  } from "@lenso/primitives/table/core";
  import { tableStyles as s } from "@lenso/tokens/table";
  import { tick, type Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  import { getTable, getVariant, hasControl } from "./context.js";
  import Collection from "./collection.svelte";
  import WindowRow from "./window-row.svelte";

  let {
    items,
    row,
    virtualized,
    xstyle,
    class: className,
    style,
    children,
    onkeydown,
    onfocusin,
    onfocusout,
    ...rest
  }: SvelteHTMLElements["tbody"] &
    StyleXProps & {
      items?: readonly Item[];
      row?: Snippet<[Item]>;
      virtualized?: WindowOptions;
    } = $props();

  const variant = getVariant();
  const table = getTable();
  let body: HTMLTableSectionElement | undefined = $state();
  let viewport = $state<HTMLElement>();
  let start = $state(0);
  let focused = $state<TableKey>();
  let focusRequest = 0;
  const options = $derived(
    virtualized &&
      Number.isFinite(virtualized.rowHeight) &&
      Number.isFinite(virtualized.height) &&
      virtualized.rowHeight > 0 &&
      virtualized.height > 0
      ? virtualized
      : undefined,
  );
  const focusedIndex = $derived(items?.findIndex(({ key }) => key === focused));
  const indices = $derived(collectionWindow(items?.length ?? 0, start, options, focusedIndex));
  const presentation = $derived(
    styled([s.body, variant?.() === "secondary" && s.secondaryBody], xstyle, className, style),
  );

  $effect(() => {
    viewport =
      body?.closest<HTMLElement>(
        '[data-lenso-slot="table-scroll-container"],[data-lenso-slot="table-resizable-container"]',
      ) ?? undefined;
  });
  $effect(() => {
    const target = viewport;
    const config = options;
    if (!target || !config) return;
    const scroll = () => {
      start = Math.floor(target.scrollTop / config.rowHeight);
    };
    scroll();
    target.addEventListener("scroll", scroll, { passive: true });
    return () => target.removeEventListener("scroll", scroll);
  });
  $effect(() => {
    if (items && row && options)
      return table?.registerWindow({
        items,
        focus: (key) => void focusRow(items?.findIndex((item) => item.key === key) ?? -1, 0),
      });
  });

  function eventRow(target: EventTarget | null) {
    if (!(target instanceof Element)) return;
    const element = target.closest<HTMLTableRowElement>("[data-window-index]");
    if (element?.parentElement === body) return element ?? undefined;
  }

  async function focusRow(index: number, column: number) {
    const item = items?.[index];
    if (!item || !options) return;
    const request = ++focusRequest;
    focused = item.key;
    if (viewport) {
      revealWindowRow(viewport, index, options);
      start = Math.floor(viewport.scrollTop / options.rowHeight);
    }
    await tick();
    if (request !== focusRequest || items?.[index]?.key !== item.key) return;
    const target = body?.querySelector<HTMLTableRowElement>(
      `:scope > [data-window-index="${index}"]`,
    );
    (target?.cells[column] ?? target?.cells[0])?.focus({ preventScroll: true });
  }

  function navigate(event: KeyboardEvent) {
    const current = eventRow(event.target);
    if (!options || !items || !current || event.defaultPrevented || hasControl(event.target))
      return;
    const index = Number(current.dataset["windowIndex"]);
    const direction =
      event.key === "ArrowDown" || (event.ctrlKey && event.key === "Home")
        ? 1
        : event.key === "ArrowUp" || (event.ctrlKey && event.key === "End")
          ? -1
          : 0;
    if (!direction) return;
    event.preventDefault();
    let next =
      event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : index + direction;
    while (
      next >= 0 &&
      next < items.length &&
      (items[next]!.disabled || table?.disabled(items[next]!.key))
    )
      next += direction;
    if (next >= 0 && next < items.length && next !== index) {
      const cell = (event.target as HTMLElement).closest<HTMLTableCellElement>("td,th");
      if (event.shiftKey && table) table.extendSelection(items[index]!.key, items[next]!.key);
      void focusRow(next, cell?.cellIndex ?? 0);
    }
  }
</script>

{#snippet spacer(count: number)}
  {#if count > 0 && options}
    <tr aria-hidden="true">
      <td
        colspan="1000"
        style:height={`${count * options.rowHeight}px`}
        style:padding="0"
        style:border="0"
      ></td>
    </tr>
  {/if}
{/snippet}

<tbody
  data-lenso-slot="table-body"
  {...rest}
  {...presentation}
  bind:this={body}
  onkeydown={(event) => {
    onkeydown?.(event);
    navigate(event);
  }}
  onfocusin={(event) => {
    onfocusin?.(event);
    const current = eventRow(event.target);
    if (current) focused = items?.[Number(current.dataset["windowIndex"])]?.key;
  }}
  onfocusout={(event) => {
    onfocusout?.(event);
    if (event.relatedTarget instanceof Node && !body?.contains(event.relatedTarget))
      focused = undefined;
  }}
>
  {#if items && row}
    {#if options}
      {#each indices as index, position (items[index]!.key)}
        {@render spacer(index - (position === 0 ? 0 : indices[position - 1]! + 1))}
        <WindowRow {index} height={options.rowHeight}>
          {@render row(items[index]!)}
        </WindowRow>
      {/each}
      {@render spacer(items.length - (indices.length ? indices.at(-1)! + 1 : 0))}
    {:else}
      <Collection {items} children={row} />
    {/if}
  {:else}
    {@render children?.()}
  {/if}
</tbody>
