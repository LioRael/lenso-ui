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
  const presentation = $derived(styled(alertStyles.title, xstyle, className, style));
</script>

<div data-lenso-slot="alert-title" {...rest} {...presentation}>
  {@render children?.()}
</div>
