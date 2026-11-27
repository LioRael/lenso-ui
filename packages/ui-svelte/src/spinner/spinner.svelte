<script module lang="ts">
  export type SpinnerProps = Omit<SvelteHTMLElements["output"], "children" | "color"> &
    StyleXProps & {
      size?: keyof typeof spinnerSizes;
      color?: keyof typeof spinnerColors;
    };
</script>

<script lang="ts">
  import { spinnerColors, spinnerSizes, spinnerStyles } from "@lenso/tokens/spinner";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { attributes, styled, type StyleXProps } from "../styled.js";

  let {
    size = "md",
    color = "secondary",
    xstyle,
    class: className,
    style,
    ...rest
  }: SpinnerProps = $props();
  const dimension = $derived(size === "sm" ? 22 : 30);
  const thickness = $derived(size === "sm" ? 3 : 4);
  const presentation = $derived(
    styled(
      [spinnerStyles.root, spinnerSizes[size], spinnerColors[color]],
      xstyle,
      className,
      style,
    ),
  );
</script>

<output aria-label="Loading" data-lenso-slot="spinner" {...rest} {...presentation}>
  <svg
    {...attributes(spinnerStyles.icon)}
    aria-hidden="true"
    viewBox={`0 0 ${dimension} ${dimension}`}
  >
    {#each [0, 1, 2, 3, 4, 5, 6, 7] as index (index)}
      <rect
        x={(dimension - thickness) / 2}
        y="0"
        width={thickness}
        height={size === "sm" ? 7 : 10}
        rx={thickness / 2}
        fill="currentColor"
        opacity={1 - index * 0.12}
        transform={`rotate(${index * 45} ${dimension / 2} ${dimension / 2})`}
      />
    {/each}
  </svg>
</output>
