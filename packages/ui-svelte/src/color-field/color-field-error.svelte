<script lang="ts">
  import { colorFieldStyles } from "@lenso/tokens/color-field";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(colorFieldStyles.error, xstyle, className, style));
</script>

<div data-lenso-slot="color-field-error" {...rest} {...presentation}>
  {@render children?.()}
</div>
