<script lang="ts">
  import { switchStyles } from "@lenso/tokens/switch";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(switchStyles.icon, xstyle, className, style));
</script>

<span data-lenso-slot="switch-icon" {...rest} {...presentation}>
  {@render children?.()}
</span>
