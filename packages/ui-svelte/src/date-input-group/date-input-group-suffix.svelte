<script lang="ts">
  import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(dateInputGroupStyles.suffix, xstyle, className, style));
</script>

<span data-lenso-slot="date-input-group-suffix" {...rest} {...presentation}>
  {@render children?.()}
</span>
