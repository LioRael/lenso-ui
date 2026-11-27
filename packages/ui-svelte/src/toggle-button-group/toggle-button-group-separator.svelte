<script lang="ts">
  import { toggleButtonGroupStyles } from "@lenso/tokens/toggle-button-group";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(
    styled(toggleButtonGroupStyles.separator, xstyle, className, style),
  );
</script>

<span data-lenso-slot="toggle-button-group-separator" {...rest} {...presentation}>
  {@render children?.()}
</span>
