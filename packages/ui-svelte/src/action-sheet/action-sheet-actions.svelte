<script lang="ts">
  import { actionSheetStyles } from "@lenso/tokens/action-sheet";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(actionSheetStyles.actions, xstyle, className, style));
</script>

<div data-lenso-slot="action-sheet-actions" {...rest} {...presentation}>
  {@render children?.()}
</div>
