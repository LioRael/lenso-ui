<script lang="ts">
  import { tableStyles as s } from "@lenso/tokens/table";
  import { isRTL } from "@ui-sdk/core";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  import { getColumn } from "./context.js";

  let {
    children,
    xstyle,
    class: className,
    style,
    onclick,
    onkeydown,
    onpointerdown,
    onpointermove,
    onpointerup,
    onpointercancel,
    onlostpointercapture,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();

  const column = getColumn();
  if (!column) throw new Error("Table.ColumnResizer requires Table.Column");
  let drag: { pointer: number; x: number; width: number; direction: number } | undefined;
  const presentation = $derived(styled(s.columnResizer, xstyle, className, style));
  function release(event: PointerEvent) {
    if (drag?.pointer === event.pointerId) drag = undefined;
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (A focusable ARIA separator is a keyboard-operable resize control.) -->

<span
  aria-label="Resize column"
  data-lenso-slot="table-column-resizer"
  {...rest}
  {...presentation}
  role="separator"
  tabindex="0"
  aria-orientation="vertical"
  aria-valuemin={column.min()}
  aria-valuemax={column.max()}
  aria-valuenow={column.width()}
  onclick={(event) => {
    event.stopPropagation();
    onclick?.(event);
  }}
  onkeydown={(event) => {
    event.stopPropagation();
    onkeydown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      column.resize(event.key === "Home" ? column.min() : column.max());
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const grow = event.key === (isRTL(event.currentTarget) ? "ArrowLeft" : "ArrowRight");
      column.resize(column.width() + (grow ? 1 : -1) * (event.shiftKey ? 50 : 10));
    }
  }}
  onpointerdown={(event) => {
    event.stopPropagation();
    onpointerdown?.(event);
    if (event.defaultPrevented || event.button !== 0 || drag) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag = {
      pointer: event.pointerId,
      x: event.clientX,
      width: column.width(),
      direction: isRTL(event.currentTarget) ? -1 : 1,
    };
  }}
  onpointermove={(event) => {
    onpointermove?.(event);
    if (drag && drag.pointer === event.pointerId && !event.defaultPrevented) {
      column.resize(drag.width + (event.clientX - drag.x) * drag.direction);
    }
  }}
  onpointerup={(event) => {
    release(event);
    onpointerup?.(event);
  }}
  onpointercancel={(event) => {
    release(event);
    onpointercancel?.(event);
  }}
  onlostpointercapture={(event) => {
    release(event);
    onlostpointercapture?.(event);
  }}
>
  {@render children?.()}
</span>
