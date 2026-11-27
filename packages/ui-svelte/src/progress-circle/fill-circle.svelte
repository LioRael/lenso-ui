<script lang="ts">
  import { progressCircleStyles } from "@lenso/tokens/progress-circle";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  import { getProgress } from "./context.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["circle"] & StyleXProps = $props();
  const progress = getProgress();
  const circumference = $derived(2 * Math.PI * Number(rest.r ?? 16));
  const fraction = $derived.by(() => {
    const { value, min = 0, max = 100 } = progress?.() ?? {};
    if (value == null) return 0.25;
    return max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  });
  const presentation = $derived(styled(progressCircleStyles.fillCircle, xstyle, className, style));
</script>

<circle
  cx="18"
  cy="18"
  r="16"
  stroke-width="4"
  stroke-linecap="round"
  stroke-dasharray={circumference}
  stroke-dashoffset={circumference * (1 - fraction)}
  transform={`rotate(-90 ${rest.cx ?? 18} ${rest.cy ?? 18})`}
  data-lenso-slot="progress-circle-fill-circle"
  {...rest}
  {...presentation}
>
  {@render children?.()}
</circle>
