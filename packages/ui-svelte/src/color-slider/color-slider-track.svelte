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
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(colorSliderStyles.track, xstyle, className, style));
</script>

<div data-lenso-slot="color-slider-track" {...rest} {...presentation}>{@render children?.()}</div>
