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
  }: SvelteHTMLElements["p"] & StyleXProps = $props();
  const presentation = $derived(styled(commandStyles.message, xstyle, className, style));
</script>

<p data-lenso-slot="command-message" {...rest} {...presentation}>
  {@render children?.()}
</p>
