<script lang="ts">
  import { tableStyles as s } from "@lenso/tokens/table";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(s.scrollContainer, xstyle, className, style));
</script>

<div data-lenso-slot="table-scroll-container" {...rest} {...presentation}>
  {@render children?.()}
</div>
