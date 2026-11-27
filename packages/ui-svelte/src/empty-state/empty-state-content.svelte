<script lang="ts">
  import { emptyStateStyles } from "@lenso/tokens/empty-state";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(emptyStateStyles.content, xstyle, className, style));
</script>

<div data-lenso-slot="empty-state-content" {...rest} {...presentation}>
  {@render children?.()}
</div>
