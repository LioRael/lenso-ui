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
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(timeFieldStyles.error, xstyle, className, style));
</script>

<div data-lenso-slot="time-field-error" {...rest} {...presentation}>
  {@render children?.()}
</div>
