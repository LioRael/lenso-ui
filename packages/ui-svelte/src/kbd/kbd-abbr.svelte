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
  }: SvelteHTMLElements["abbr"] & StyleXProps = $props();
  const presentation = $derived(styled(kbdStyles.abbr, xstyle, className, style));
</script>

<abbr data-lenso-slot="kbd-abbr" {...rest} {...presentation}>
  {@render children?.()}
</abbr>
