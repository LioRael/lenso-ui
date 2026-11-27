<script lang="ts">
  import { radioStyles } from "@lenso/tokens/radio";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(radioStyles.content, xstyle, className, style));
</script>

<span data-lenso-slot="radio-content" {...rest} {...presentation}>
  {@render children?.()}
</span>
