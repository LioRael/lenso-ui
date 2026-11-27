<script lang="ts">
  import { selectStyles } from "@lenso/tokens/select";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(selectStyles.indicator, xstyle, className, style));
</script>

<span data-lenso-slot="select-indicator" {...rest} {...presentation}>
  {@render children?.()}
</span>
