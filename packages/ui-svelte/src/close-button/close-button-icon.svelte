<script lang="ts">
  import { closeButtonStyles } from "@lenso/tokens/close-button";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["svg"] & StyleXProps = $props();
  const presentation = $derived(styled(closeButtonStyles.icon, xstyle, className, style));
</script>

<svg data-lenso-slot="close-button-icon" {...rest} {...presentation}>
  {@render children?.()}
</svg>
