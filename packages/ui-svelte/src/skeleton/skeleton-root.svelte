<script lang="ts">
  import { skeletonStyles, skeletonAnimations } from "@lenso/tokens/skeleton";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    animationType,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["div"], "animationType"> &
    StyleXProps & { animationType?: keyof typeof skeletonAnimations } = $props();
  const presentation = $derived(
    styled(
      [skeletonStyles.root, skeletonAnimations[animationType ?? "pulse"]],
      xstyle,
      className,
      style,
    ),
  );
</script>

<div data-lenso-slot="skeleton" {...rest} {...presentation}>
  {@render children?.()}
</div>
