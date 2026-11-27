<script lang="ts">
  import { emptyStateStyles } from "@lenso/tokens/empty-state";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    variant,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["div"], "variant"> &
    StyleXProps & { variant?: "plain" | "circle" } = $props();
  const presentation = $derived(
    styled(
      [emptyStateStyles.icon, variant === "circle" && emptyStateStyles.circle],
      xstyle,
      className,
      style,
    ),
  );
</script>

<div data-lenso-slot="empty-state-icon" {...rest} {...presentation}>
  {@render children?.()}
</div>
