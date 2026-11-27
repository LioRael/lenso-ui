<script lang="ts">
  import { typographyStyles, typographyTypes } from "@lenso/tokens/typography";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["code"] & StyleXProps = $props();
  const presentation = $derived(
    styled([typographyStyles.root, typographyTypes.code], xstyle, className, style),
  );
</script>

<code data-lenso-slot="typography-code" {...rest} {...presentation}>
  {@render children?.()}
</code>
