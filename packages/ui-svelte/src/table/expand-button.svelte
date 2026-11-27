<script lang="ts">
  import { Button, type ButtonProps } from "../button/index.js";
  import { getRow, getTable } from "./context.js";

  let { children: content, disabled, onclick, ...rest }: ButtonProps = $props();
  const row = getRow();
  const table = getTable();
  const key = $derived(row?.key());
  const expanded = $derived(row?.expanded());
</script>

<Button
  isIconOnly
  size="sm"
  variant="borderless"
  aria-label={expanded ? "Collapse row" : "Expand row"}
  {...rest}
  data-lenso-slot="table-expand-button"
  aria-expanded={key !== undefined ? expanded : rest["aria-expanded"]}
  disabled={disabled || row?.disabled()}
  onclick={(event, details) => {
    event.stopPropagation();
    const result = onclick?.(event, details);
    if (!event.defaultPrevented && key !== undefined && !row?.disabled())
      table?.toggleExpanded(key);
    return result;
  }}
>
  {#snippet children(state)}
    {#if content}{@render content(state)}{:else}{expanded ? "−" : "+"}{/if}
  {/snippet}
</Button>
