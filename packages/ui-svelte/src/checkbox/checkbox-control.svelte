<!-- Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0.
     Modified for Svelte composition with UI SDK state and Lenso StyleX. -->
<script lang="ts">
  import { CheckboxVariantContext } from "./variant.js";
  import { checkboxStyles } from "@lenso/tokens/checkbox";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    variant,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps & { variant?: "primary" | "secondary" } = $props();
  const inherited = CheckboxVariantContext.get();
  const presentation = $derived(
    styled(
      [
        checkboxStyles.control,
        (variant ?? inherited?.()) === "secondary" && checkboxStyles.secondary,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<span data-lenso-slot="checkbox-control" {...rest} {...presentation}>
  {@render children?.()}
</span>
