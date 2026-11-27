<script lang="ts">
  import { autocompleteFieldStyles } from "@lenso/tokens/autocomplete";
  import { styled, type StyleXProps } from "../styled.js";
  import type { SvelteHTMLElements } from "svelte/elements";
  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(
    styled(autocompleteFieldStyles.inputGroup, xstyle, className, style),
  );
</script>

<div data-lenso-slot="autocomplete-input-group" {...rest} {...presentation}>
  {@render children?.()}
</div>
