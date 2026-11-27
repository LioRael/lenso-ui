<script lang="ts">
  import { shareSheetStyles } from "@lenso/tokens/share-sheet";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(shareSheetStyles.header, xstyle, className, style));
</script>

<div data-lenso-slot="share-sheet-header" {...rest} {...presentation}>
  {@render children?.()}
</div>
