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
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(shareSheetStyles.targetIcon, xstyle, className, style));
</script>

<span data-lenso-slot="share-sheet-target-icon" {...rest} {...presentation}>
  {@render children?.()}
</span>
