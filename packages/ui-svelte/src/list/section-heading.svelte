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
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(s.sectionHeading, xstyle, className, style));
</script>

<div data-lenso-slot="list-section-heading" {...rest} {...presentation}>
  {@render children?.()}
</div>
