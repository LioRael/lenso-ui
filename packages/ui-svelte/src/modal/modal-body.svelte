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
  const presentation = $derived(styled(modalStyles.body, xstyle, className, style));
</script>

<div data-lenso-slot="modal-body" {...rest} {...presentation}>
  {@render children?.()}
</div>
