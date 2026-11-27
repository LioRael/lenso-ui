<script lang="ts">
  import { RadioVariantContext } from "./variant.js";
  import { radioStyles } from "@lenso/tokens/radio";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    variant,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["span"], "variant"> &
    StyleXProps & { variant?: "primary" | "secondary" } = $props();
  const inherited = RadioVariantContext.get();
  const presentation = $derived(
    styled(
      [radioStyles.control, (variant ?? inherited?.()) === "secondary" && radioStyles.secondary],
      xstyle,
      className,
      style,
    ),
  );
</script>

<span data-lenso-slot="radio-control" {...rest} {...presentation}>
  {@render children?.()}
</span>
