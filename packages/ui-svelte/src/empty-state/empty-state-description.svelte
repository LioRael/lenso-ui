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
  }: SvelteHTMLElements["p"] & StyleXProps = $props();
  const presentation = $derived(styled(emptyStateStyles.description, xstyle, className, style));
</script>

<p data-lenso-slot="empty-state-description" {...rest} {...presentation}>
  {@render children?.()}
</p>
