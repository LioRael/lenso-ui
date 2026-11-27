<script lang="ts">
  import { colorInputGroupStyles } from "@lenso/tokens/color-input-group";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(colorInputGroupStyles.suffix, xstyle, className, style));
</script>

<div data-lenso-slot="color-input-group-suffix" {...rest} {...presentation}>
  {@render children?.()}
</div>
