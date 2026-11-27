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
  }: SvelteHTMLElements["button"] & StyleXProps = $props();
  const presentation = $derived(styled(shareSheetStyles.action, xstyle, className, style));
</script>

<button data-lenso-slot="share-sheet-action" {...rest} {...presentation}>
  {@render children?.()}
</button>
