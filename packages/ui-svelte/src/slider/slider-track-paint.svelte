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
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(sliderStyles.trackPaint, xstyle, className, style));
</script>

<span data-lenso-slot="slider-track-paint" {...rest} {...presentation}>
  {@render children?.()}
</span>
