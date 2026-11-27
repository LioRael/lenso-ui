<script lang="ts">
  import { toastStyles } from "@lenso/tokens/toast";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { getToastAppearance } from "./context.js";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const pill = getToastAppearance();
  const presentation = $derived(
    styled(
      [toastStyles.fading, toastStyles.content, pill?.pill() && toastStyles.pillContent],
      xstyle,
      className,
      style,
    ),
  );
</script>

<div data-lenso-slot="toast-content" {...rest} {...presentation}>
  {@render children?.()}
</div>
