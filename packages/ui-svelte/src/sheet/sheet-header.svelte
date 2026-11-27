<script lang="ts">
  import { sheetStyles } from "@lenso/tokens/sheet";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(sheetStyles.header, xstyle, className, style));
</script>

<div data-lenso-slot="sheet-header" {...rest} {...presentation}>
  {@render children?.()}
</div>
