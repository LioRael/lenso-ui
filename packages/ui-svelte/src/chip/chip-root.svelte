<script lang="ts">
  import {
    chipStyles,
    chipPrimary,
    chipSoft,
    chipColors,
    chipSizes,
    chipVariants,
  } from "@lenso/tokens/chip";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    color,
    size,
    variant,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["span"], "color" | "size" | "variant"> &
    StyleXProps & {
      color?: keyof typeof chipColors;
      size?: keyof typeof chipSizes;
      variant?: "primary" | "secondary" | "soft" | "tertiary";
    } = $props();
  const presentation = $derived(
    styled(
      [
        chipStyles.root,
        chipSizes[size ?? "md"],
        chipColors[color ?? "default"],
        variant === "primary" && chipPrimary[color ?? "default"],
        variant === "soft" && chipSoft[color ?? "default"],
        variant === "tertiary" && chipVariants.tertiary,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<span data-lenso-slot="chip" {...rest} {...presentation}>
  {@render children?.()}
</span>
