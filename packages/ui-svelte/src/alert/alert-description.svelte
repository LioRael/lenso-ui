<script lang="ts">
  import { alertStyles } from "@lenso/tokens/alert";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(alertStyles.description, xstyle, className, style));
</script>

<div data-lenso-slot="alert-description" {...rest} {...presentation}>
  {@render children?.()}
</div>
