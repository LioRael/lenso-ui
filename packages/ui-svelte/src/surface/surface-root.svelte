<script lang="ts">
  import { surfaceStyles, surfaceVariants, groupStyles } from "@lenso/tokens/surface";
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
    StyleXProps & { variant?: keyof typeof surfaceVariants } = $props();
  const presentation = $derived(
    styled(
      [
        variant === "glass" && materialStyles.root,
        variant === "glass" && materialStyles.thick,
        surfaceStyles.root,
        (!variant || variant === "default") && groupStyles.surface,
        surfaceVariants[variant ?? "default"],
        variant === "glass" && materialStyles.accessible,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<div data-lenso-slot="surface" {...rest} {...presentation}>
  {@render children?.()}
</div>
