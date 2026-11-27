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
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(typographyStyles.root, xstyle, className, style));
</script>

<div data-lenso-slot="typography-prose" {...rest} {...presentation}>
  {@render children?.()}
</div>
