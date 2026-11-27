<script lang="ts">
  import {
    badgeStyles,
    badgePrimary,
    badgeSoft,
    badgeColors,
    badgeSizes,
    badgePlacements,
  } from "@lenso/tokens/badge";
  import { materialStyles } from "@lenso/tokens/materials";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    color,
    size,
    variant,
    placement,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["span"], "color" | "size" | "variant" | "placement"> &
    StyleXProps & {
      color?: keyof typeof badgeColors;
      size?: keyof typeof badgeSizes;
      variant?: "primary" | "secondary" | "soft" | "tertiary";
      placement?: keyof typeof badgePlacements;
    } = $props();
  const presentation = $derived(
    styled(
      [
        materialStyles.root,
        materialStyles.accessible,
        badgeStyles.root,
        badgeSizes[size ?? "md"],
        badgeColors[color ?? "default"],
        variant === "primary" && badgePrimary[color ?? "default"],
        variant === "soft" && badgeSoft[color ?? "default"],
        placement && badgePlacements[placement],
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<span data-lenso-slot="badge" {...rest} {...presentation}>
  {@render children?.()}
</span>
