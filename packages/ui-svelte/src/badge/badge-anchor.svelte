<script lang="ts">
  import { badgeStyles } from "@lenso/tokens/badge";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(badgeStyles.anchor, xstyle, className, style));
</script>

<span data-lenso-slot="badge-anchor" {...rest} {...presentation}>
  {@render children?.()}
</span>
