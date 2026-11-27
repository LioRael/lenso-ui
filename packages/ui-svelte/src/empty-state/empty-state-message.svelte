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
  const presentation = $derived(styled(emptyStateStyles.message, xstyle, className, style));
</script>

<div data-lenso-slot="empty-state-message" {...rest} {...presentation}>
  {@render children?.()}
</div>
