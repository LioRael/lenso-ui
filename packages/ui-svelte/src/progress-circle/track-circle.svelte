<script lang="ts">
  import { progressCircleStyles } from "@lenso/tokens/progress-circle";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["circle"] & StyleXProps = $props();
  const presentation = $derived(styled(progressCircleStyles.trackCircle, xstyle, className, style));
</script>

<circle
  cx="18"
  cy="18"
  r="16"
  stroke-width="4"
  data-lenso-slot="progress-circle-track-circle"
  {...rest}
  {...presentation}
>
  {@render children?.()}
</circle>
