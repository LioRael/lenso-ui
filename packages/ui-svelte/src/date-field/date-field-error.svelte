<script lang="ts">
  import { dateFieldStyles } from "@lenso/tokens/date-field";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(dateFieldStyles.error, xstyle, className, style));
</script>

<div data-lenso-slot="date-field-error" {...rest} {...presentation}>
  {@render children?.()}
</div>
