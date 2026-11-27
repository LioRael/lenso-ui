<script lang="ts">
  import { modalStyles } from "@lenso/tokens/modal";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(modalStyles.footer, xstyle, className, style));
</script>

<div data-lenso-slot="drawer-footer" {...rest} {...presentation}>
  {@render children?.()}
</div>
