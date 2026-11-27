<script lang="ts">
  import { timeFieldStyles } from "@lenso/tokens/time-field";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["label"] & StyleXProps = $props();
  const presentation = $derived(styled(timeFieldStyles.label, xstyle, className, style));
</script>

<label data-lenso-slot="label" {...rest} {...presentation}>
  {@render children?.()}
</label>
