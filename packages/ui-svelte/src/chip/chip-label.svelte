<script lang="ts">
  import { chipStyles } from "@lenso/tokens/chip";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(chipStyles.label, xstyle, className, style));
</script>

<span data-lenso-slot="chip-label" {...rest} {...presentation}>
  {@render children?.()}
</span>
