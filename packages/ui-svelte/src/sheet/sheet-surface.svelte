<script lang="ts">
  import { sheetStyles } from "@lenso/tokens/sheet";
  import { materialStyles } from "@lenso/tokens/materials";
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
    styled(
      [materialStyles.root, materialStyles.accessible, sheetStyles.surface],
      xstyle,
      className,
      style,
    ),
  );
</script>

<div data-lenso-slot="sheet-surface" {...rest} {...presentation}>
  {@render children?.()}
</div>
