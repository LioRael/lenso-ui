<script lang="ts">
  import { colorSliderStyles } from "@lenso/tokens/color-slider";
  import { styled, type StyleXProps } from "../styled.js";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { getChannel } from "./context.js";
  const channel = getChannel();
  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["output"] & StyleXProps = $props();
  const presentation = $derived(styled(colorSliderStyles.output, xstyle, className, style));
</script>

<output data-lenso-slot="color-slider-output" {...rest} {...presentation}>
  {#if children}{@render children()}{:else}{channel?.()}{/if}
</output>
