<script lang="ts">
  import { kbdStyles } from "@lenso/tokens/kbd";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(kbdStyles.content, xstyle, className, style));
</script>

<span data-lenso-slot="kbd-content" {...rest} {...presentation}>
  {@render children?.()}
</span>
