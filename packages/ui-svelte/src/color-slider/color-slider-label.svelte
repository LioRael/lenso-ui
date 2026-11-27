<script lang="ts">
  import { colorSliderStyles } from "@lenso/tokens/color-slider";
  import { styled, type StyleXProps } from "../styled.js";
  import type { SvelteHTMLElements } from "svelte/elements";
  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["label"] & StyleXProps = $props();
  const presentation = $derived(styled(colorSliderStyles.label, xstyle, className, style));
</script>

<label data-lenso-slot="color-slider-label" {...rest} {...presentation}>
  {@render children?.()}
</label>
