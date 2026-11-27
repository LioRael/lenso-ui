<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  import { getRow, getTable } from "./context.js";

  let {
    checked = $bindable(),
    disabled,
    onchange,
    indeterminate,
    xstyle,
    class: className,
    style,
    ...rest
  }: Omit<SvelteHTMLElements["input"], "type"> & StyleXProps = $props();
  const table = getTable();
  const row = getRow();
  let node: HTMLInputElement | undefined = $state();
  const key = $derived(row?.key());
  const managed = $derived(Boolean(table && table.mode() !== "none"));
  const selection = $derived.by(() => {
    if (!managed || !table) return checked;
    if (key !== undefined) return table.selected().has(key);
    const keys = table.enabledKeys();
    return keys.length > 0 && keys.every((key) => table.selected().has(key));
  });
  const mixed = $derived(
    managed && key === undefined
      ? !selection && Boolean(table?.enabledKeys().some((key) => table.selected().has(key)))
      : Boolean(indeterminate),
  );
  $effect(() => {
    if (node) node.indeterminate = mixed;
  });
  const presentation = $derived(styled(undefined, xstyle, className, style));
</script>

<input
  type="checkbox"
  aria-label={key === undefined ? "Select all" : "Select row"}
  data-lenso-slot="table-selection-checkbox"
  {...rest}
  {...presentation}
  bind:this={node}
  checked={selection}
  disabled={disabled ||
    row?.disabled() ||
    (managed && key === undefined && table?.mode() === "single")}
  onchange={(event) => {
    onchange?.(event);
    const input = event.currentTarget;
    if (!managed || !table) {
      if (!event.defaultPrevented) checked = input.checked;
      return;
    }
    if (!event.defaultPrevented) {
      if (key !== undefined) table.select(key);
      else table.selectAll(input.checked);
    }
    queueMicrotask(() => {
      input.checked = Boolean(selection);
      input.indeterminate = mixed;
    });
  }}
/>
