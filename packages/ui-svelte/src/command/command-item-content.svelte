<script lang="ts">
  import { commandStyles } from "@lenso/tokens/command";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(commandStyles.itemContent, xstyle, className, style));
</script>

<span data-lenso-slot="command-item-content" {...rest} {...presentation}>
  {@render children?.()}
</span>
