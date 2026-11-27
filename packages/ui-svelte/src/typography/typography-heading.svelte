<script lang="ts">
  import { typographyStyles } from "@lenso/tokens/typography";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["h2"] & StyleXProps = $props();
  const presentation = $derived(styled(typographyStyles.root, xstyle, className, style));
</script>

<h2 data-lenso-slot="typography-heading" {...rest} {...presentation}>
  {@render children?.()}
</h2>
