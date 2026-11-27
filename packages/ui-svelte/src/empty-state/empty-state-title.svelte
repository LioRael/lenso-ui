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
  }: SvelteHTMLElements["h3"] & StyleXProps = $props();
  const presentation = $derived(styled(emptyStateStyles.title, xstyle, className, style));
</script>

<h3 data-lenso-slot="empty-state-title" {...rest} {...presentation}>
  {@render children?.()}
</h3>
