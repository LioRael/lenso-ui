<script lang="ts">
  import { sliderStyles } from "@lenso/tokens/slider";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(sliderStyles.marks, xstyle, className, style));
</script>

<div data-lenso-slot="slider-marks" {...rest} {...presentation}>
  {@render children?.()}
</div>
