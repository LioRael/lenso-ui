<script lang="ts">
  import { commandStyles } from "@lenso/tokens/command";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(commandStyles.inputGroup, xstyle, className, style));
</script>

<div data-lenso-slot="command-input-group" {...rest} {...presentation}>
  {@render children?.()}
</div>
