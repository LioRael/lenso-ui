<script lang="ts">
  import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(
    styled(inputGroupMaterialStyles.adornment, xstyle, className, style),
  );
</script>

<div data-lenso-slot="input-group-suffix" {...rest} {...presentation}>
  {@render children?.()}
</div>
