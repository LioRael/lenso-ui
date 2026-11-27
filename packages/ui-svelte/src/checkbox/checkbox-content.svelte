<!-- Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0.
     Modified for Svelte composition with UI SDK state and Lenso StyleX. -->
<script lang="ts">
  import { checkboxStyles } from "@lenso/tokens/checkbox";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(checkboxStyles.content, xstyle, className, style));
</script>

<span data-lenso-slot="checkbox-content" {...rest} {...presentation}>
  {@render children?.()}
</span>
