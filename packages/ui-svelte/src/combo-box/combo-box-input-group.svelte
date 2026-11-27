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
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(
    styled([comboBoxStyles.inputGroup, comboBoxStyles.field], xstyle, className, style),
  );
</script>

<div data-lenso-slot="combo-box-input-group" {...rest} {...presentation}>
  {@render children?.()}
</div>
