<script lang="ts">
  import { timeFieldStyles } from "@lenso/tokens/time-field";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(timeFieldStyles.description, xstyle, className, style));
</script>

<span data-lenso-slot="time-field-description" {...rest} {...presentation}>
  {@render children?.()}
</span>
