<script lang="ts">
  import { comboBoxStyles } from "@lenso/tokens/combo-box";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(comboBoxStyles.icon, xstyle, className, style));
</script>

<span data-lenso-slot="combo-box-indicator" {...rest} {...presentation}>
  {@render children?.()}
</span>
