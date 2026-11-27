<!-- Copyright NextUI Inc. Apache-2.0. Modified for Svelte. -->
<script module lang="ts">
  export type CalendarYearPickerTriggerRenderProps = { isOpen: boolean; monthYear: string };
</script>

<script lang="ts">
  import { calendarYearPickerStyles as s } from "@lenso/tokens/calendar-year-picker";
  import { CollapsibleTrigger } from "@ui-sdk/svelte/collapsible";
  import { withSource } from "@ui-sdk/core/observe";
  import type { ComponentProps, Snippet } from "svelte";
  import { styled, type StyleXProps } from "../styled.js";
  import { getYearPicker, yearDate, type WithChildren } from "./context.js";
  import Heading from "./trigger-heading.svelte";
  import Indicator from "./trigger-indicator.svelte";

  let {
    children: content,
    xstyle,
    class: className,
    style,
    onkeydown,
    ...rest
  }: WithChildren<
    ComponentProps<typeof CollapsibleTrigger>,
    Snippet<[CalendarYearPickerTriggerRenderProps]>
  > &
    StyleXProps = $props();
  const picker = getYearPicker();
  const monthYear = $derived.by(() => {
    const date = picker?.state().month.split("-").map(Number);
    return new Intl.DateTimeFormat(picker?.locale() ?? "en", {
      timeZone: "UTC",
      month: "long",
      year: "numeric",
    }).format(yearDate(date?.[0] ?? 1970, (date?.[1] ?? 1) - 1));
  });
  const presentation = $derived(styled(s.trigger, xstyle, className, style));
</script>

<CollapsibleTrigger
  aria-label={`${monthYear}, year selector`}
  data-lenso-slot="calendar-year-picker-trigger"
  {...rest}
  {...presentation}
  onkeydown={(event) => {
    onkeydown?.(event);
    if (!event.defaultPrevented && event.key === "Escape" && picker?.open()) {
      event.preventDefault();
      withSource("keyboard", () => picker.disclosure.setOpen(false));
    }
  }}
>
  {#if content}
    {@render content({ isOpen: Boolean(picker?.open()), monthYear })}
  {:else}
    <Heading />
    <Indicator />
  {/if}
</CollapsibleTrigger>
