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
  }: SvelteHTMLElements["a"] & StyleXProps = $props();
  const presentation = $derived(styled(linkStyles.root, xstyle, className, style));
</script>

<a data-lenso-slot="link" {...rest} {...presentation}>
  {@render children?.()}
</a>
