<script lang="ts">
  import { alertStyles } from "@lenso/tokens/alert";
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
      [materialStyles.root, alertStyles.root, materialStyles.accessible],
      xstyle,
      className,
      style,
    ),
  );
</script>

<div data-lenso-slot="alert" {...rest} {...presentation}>
  {@render children?.()}
</div>
