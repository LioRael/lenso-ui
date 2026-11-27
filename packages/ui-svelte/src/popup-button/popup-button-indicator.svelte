<script lang="ts">
  import { popupButtonStyles } from "@lenso/tokens/popup-button";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(popupButtonStyles.indicator, xstyle, className, style));
</script>

<span data-lenso-slot="popup-button-indicator" {...rest} {...presentation}>
  {@render children?.()}
</span>
