<script lang="ts">
  import { stepperStyles } from "@lenso/tokens/stepper";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(stepperStyles.separator, xstyle, className, style));
</script>

<span data-lenso-slot="stepper-separator" {...rest} {...presentation}>
  {@render children?.()}
</span>
