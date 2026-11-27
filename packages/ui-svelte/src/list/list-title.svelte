<script lang="ts">
  import { listStyles as s } from "@lenso/tokens/list";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(s.title, xstyle, className, style));
</script>

<span data-lenso-slot="list-title" {...rest} {...presentation}>
  {@render children?.()}
</span>
