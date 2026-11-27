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
  const presentation = $derived(styled(colorInputGroupStyles.root, xstyle, className, style));
</script>

<div data-lenso-slot="color-input-group" {...rest} {...presentation}>
  {@render children?.()}
</div>
