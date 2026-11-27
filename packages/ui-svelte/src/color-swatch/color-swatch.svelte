<!-- Copyright NextUI Inc. Apache-2.0. Modified for Svelte and native CSS colors. -->
<script module lang="ts">
  export type ColorSwatchProps = Omit<SvelteHTMLElements["div"], "color"> &
    StyleXProps & {
      color?: string;
      colorName?: string;
      size?: "xs" | "sm" | "md" | "lg" | "xl";
      shape?: "circle" | "square";
    };
</script>

<script lang="ts">
  import { colorSwatchStyles } from "@lenso/tokens/color-swatch";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    color = "#ff0000",
    colorName,
    size = "md",
    shape,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: ColorSwatchProps = $props();
  const background = $derived(
    `linear-gradient(${color},${color}),var(--lenso-color-checkerboard) 50% / 16px 16px`,
  );
  const presentation = $derived(
    styled(
      [
        colorSwatchStyles.root,
        colorSwatchStyles[size],
        shape === "square" && colorSwatchStyles.square,
      ],
      xstyle,
      className,
      `background:${background};${style ?? ""}`,
    ),
  );
</script>

<div
  role="img"
  aria-label={colorName ?? color}
  data-lenso-slot="color-swatch"
  {...rest}
  {...presentation}
>
  {@render children?.()}
</div>
