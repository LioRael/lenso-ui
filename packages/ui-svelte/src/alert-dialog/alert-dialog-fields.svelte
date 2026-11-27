<script lang="ts">
  import { alertDialogStyles } from "@lenso/tokens/alert-dialog";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(alertDialogStyles.fields, xstyle, className, style));
</script>

<div data-lenso-slot="alert-dialog-fields" {...rest} {...presentation}>
  {@render children?.()}
</div>
