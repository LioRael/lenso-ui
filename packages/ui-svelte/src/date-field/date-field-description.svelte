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
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(dateFieldStyles.description, xstyle, className, style));
</script>

<span data-lenso-slot="date-field-description" {...rest} {...presentation}>
  {@render children?.()}
</span>
