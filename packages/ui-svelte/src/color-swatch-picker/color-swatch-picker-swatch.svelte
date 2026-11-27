<script lang="ts">
  import { colorSwatchPickerStyles } from "@lenso/tokens/color-swatch-picker";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(colorSwatchPickerStyles.swatch, xstyle, className, style));
</script>

<span data-lenso-slot="color-swatch-picker-swatch" {...rest} {...presentation}>
  {@render children?.()}
</span>
