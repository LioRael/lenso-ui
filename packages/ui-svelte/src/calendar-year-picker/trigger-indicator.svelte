<!-- Copyright NextUI Inc. Apache-2.0. Modified for Svelte. -->
<script lang="ts">
  import { calendarYearPickerStyles as s } from "@lenso/tokens/calendar-year-picker";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  import { getYearPicker } from "./context.js";

  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const picker = getYearPicker();
  const presentation = $derived(
    styled([s.indicator, picker?.open() && s.openIndicator], xstyle, className, style),
  );
</script>

<span
  data-lenso-slot="calendar-year-picker-trigger-indicator"
  aria-hidden="true"
  {...rest}
  {...presentation}
>
  {#if children}{@render children()}{:else}
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  {/if}
</span>
