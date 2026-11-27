<script lang="ts">
  import { fieldsetStyles } from "@lenso/tokens/fieldset";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(fieldsetStyles.actions, xstyle, className, style));
</script>

<div data-lenso-slot="fieldset-actions" {...rest} {...presentation}>
  {@render children?.()}
</div>
