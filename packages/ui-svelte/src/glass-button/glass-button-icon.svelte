<script lang="ts">
  import { glassButtonStyles } from "@lenso/tokens/glass-button";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(glassButtonStyles.icon, xstyle, className, style));
</script>

<span data-lenso-slot="button-icon" {...rest} {...presentation}>{@render children?.()}</span>
