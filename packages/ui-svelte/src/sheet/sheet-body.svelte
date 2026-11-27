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
  const presentation = $derived(styled(sheetStyles.body, xstyle, className, style));
</script>

<div data-lenso-slot="sheet-body" {...rest} {...presentation}>
  {@render children?.()}
</div>
