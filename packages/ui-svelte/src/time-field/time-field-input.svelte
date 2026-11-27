<script lang="ts">
  import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(dateInputGroupStyles.input, xstyle, className, style));
</script>

<div data-lenso-slot="time-field-input" {...rest} {...presentation}>{@render children?.()}</div>
