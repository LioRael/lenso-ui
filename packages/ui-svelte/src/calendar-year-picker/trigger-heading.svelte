<!-- Copyright NextUI Inc. Apache-2.0. Modified for Svelte. -->
<script lang="ts">
  import { calendarYearPickerStyles as s } from "@lenso/tokens/calendar-year-picker";
  import type { Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  import { getYearPicker, yearDate } from "./context.js";
  import type { CalendarYearPickerTriggerRenderProps } from "./trigger.svelte";

  let {
    children,
    format,
    offset,
    xstyle,
    class: className,
    style,
    ...rest
  }: Omit<SvelteHTMLElements["span"], "children"> &
    StyleXProps & {
      children?: Snippet<[CalendarYearPickerTriggerRenderProps]>;
      format?: Intl.DateTimeFormatOptions;
      offset?: { years?: number; months?: number };
    } = $props();
  const picker = getYearPicker();
  const monthYear = $derived.by(() => {
    const date = picker?.state().month.split("-").map(Number);
    return new Intl.DateTimeFormat(picker?.locale() ?? "en", {
      month: "long",
      year: "numeric",
      ...format,
      timeZone: "UTC",
    }).format(
      yearDate(
        (date?.[0] ?? 1970) + (offset?.years ?? 0),
        (date?.[1] ?? 1) - 1 + (offset?.months ?? 0),
      ),
    );
  });
  const presentation = $derived(styled(s.heading, xstyle, className, style));
</script>

<span data-lenso-slot="calendar-year-picker-trigger-heading" {...rest} {...presentation}>
  {#if children}{@render children({
      isOpen: Boolean(picker?.open()),
      monthYear,
    })}{:else}{monthYear}{/if}
</span>
