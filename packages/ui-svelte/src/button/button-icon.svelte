<script lang="ts">
  import { buttonStyles } from "@lenso/tokens/button";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(buttonStyles.icon, xstyle, className, style));
</script>

<span data-lenso-slot="button-icon" {...rest} {...presentation}>{@render children?.()}</span>
