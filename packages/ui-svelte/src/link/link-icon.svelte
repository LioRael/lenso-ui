<script lang="ts">
  import { linkStyles } from "@lenso/tokens/link";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(linkStyles.icon, xstyle, className, style));
</script>

<span data-lenso-slot="link-icon" {...rest} {...presentation}>
  {@render children?.()}
</span>
