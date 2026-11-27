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
  }: SvelteHTMLElements["p"] & StyleXProps = $props();
  const presentation = $derived(styled(typographyStyles.root, xstyle, className, style));
</script>

<p data-lenso-slot="typography-paragraph" {...rest} {...presentation}>
  {@render children?.()}
</p>
