<script lang="ts">
  import { cardStyles, cardVariants } from "@lenso/tokens/card";
  import { materialStyles } from "@lenso/tokens/materials";
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
    StyleXProps & { variant?: keyof typeof cardVariants } = $props();
  const presentation = $derived(
    styled(
      [
        variant === "glass" && materialStyles.root,
        cardStyles.root,
        cardVariants[variant ?? "default"],
        variant === "glass" && materialStyles.accessible,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<div data-lenso-slot="card" {...rest} {...presentation}>
  {@render children?.()}
</div>
