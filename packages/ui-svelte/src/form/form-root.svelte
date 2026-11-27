<script lang="ts">
  import { formStyles } from "@lenso/tokens/form";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["form"] & StyleXProps = $props();
  const presentation = $derived(styled(formStyles.root, xstyle, className, style));
</script>

<form data-lenso-slot="form" {...rest} {...presentation}>
  {@render children?.()}
</form>
