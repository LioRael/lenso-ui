<!-- Copyright NextUI Inc. Apache-2.0. Modified for Svelte. -->
<script module lang="ts">
  export type CalendarYearPickerCellRenderProps = {
    year: number;
    formattedYear: string;
    isSelected: boolean;
    isCurrentYear: boolean;
    isOpen: boolean;
    selectYear: () => void;
  };
  export type CalendarYearPickerCellProps = WithChildren<
    ComponentProps<typeof Button>,
    Snippet<[CalendarYearPickerCellRenderProps]>
  > &
    StyleXProps & {
      year: number;
    };
</script>

<script lang="ts">
  import { calendarYearPickerStyles as s } from "@lenso/tokens/calendar-year-picker";
  import { Button } from "@ui-sdk/svelte/button";
  import { withSource } from "@ui-sdk/core/observe";
  import type { ComponentProps, Snippet } from "svelte";
  import { createAttachmentKey } from "svelte/attachments";
  import { styled, type StyleXProps } from "../styled.js";
  import { getYearGrid, type WithChildren } from "./context.js";

  let {
    year,
    children: content,
    xstyle,
    class: className,
    style,
    onclick,
    disabled,
    ...rest
  }: CalendarYearPickerCellProps = $props();
  const grid = getYearGrid();
  const item = $derived(grid?.items().find((item) => item.year === year));
  const selected = $derived(year === grid?.selected());
  const inactive = $derived(Boolean(disabled || grid?.disabled()));
  const id = $derived(String(year));
  const attachment = {
    [createAttachmentKey()](el: HTMLElement) {
      return grid?.model.api.bind(el, id, inactive);
    },
  };
  const presentation = $derived(styled([s.cell, selected && s.selected], xstyle, className, style));
  const stop = $derived(
    grid?.open() && !inactive
      ? Number(grid.model.api.roving.tabIndex(grid.state(), { key: id, props: { value: id } }))
      : -1,
  );
</script>

{#if item}
  <Button
    data-lenso-slot="calendar-year-picker-year-cell"
    data-year={year}
    aria-label={item.formatted}
    data-agent-hidden=""
    aria-pressed={selected}
    tabindex={stop}
    {...rest}
    {...attachment}
    {...presentation}
    disabled={inactive}
    onclick={(event, details) => {
      const result = onclick?.(event, details);
      if (!event.defaultPrevented) withSource(details.source, () => grid?.select(year, event));
      return result;
    }}
  >
    {#if content}
      {@render content({
        year,
        formattedYear: item.formatted,
        isSelected: selected,
        isCurrentYear: year === new Date().getFullYear(),
        isOpen: Boolean(grid?.open()),
        selectYear: () => grid?.select(year),
      })}
    {:else}{item.formatted}{/if}
  </Button>
{/if}
