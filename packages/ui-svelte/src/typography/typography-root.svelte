<script lang="ts">
  import {
    typographyStyles,
    typographyTypes,
    typographyAligns,
    typographyColors,
    typographyWeights,
  } from "@lenso/tokens/typography";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    type,
    align,
    color,
    weight,
    truncate,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["span"], "type" | "align" | "color" | "weight" | "truncate"> &
    StyleXProps & {
      type?: keyof typeof typographyTypes;
      align?: keyof typeof typographyAligns;
      color?: keyof typeof typographyColors;
      weight?: keyof typeof typographyWeights;
      truncate?: boolean;
    } = $props();
  const presentation = $derived(
    styled(
      [
        typographyStyles.root,
        typographyTypes[type ?? "body"],
        typographyAligns[align ?? "start"],
        typographyColors[color ?? "default"],
        weight && typographyWeights[weight],
        truncate && typographyStyles.truncate,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<span data-lenso-slot="typography" {...rest} {...presentation}>
  {@render children?.()}
</span>
