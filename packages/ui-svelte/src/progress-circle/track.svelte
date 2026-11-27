<script lang="ts">
  import { progressCircleSizes, progressCircleStyles } from "@lenso/tokens/progress-circle";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  import { getProgress } from "./context.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["svg"] & StyleXProps = $props();
  const progress = getProgress();
  const presentation = $derived(
    styled(
      [
        progressCircleStyles.track,
        progressCircleSizes[progress?.().size ?? "md"],
        progress?.().value == null && progressCircleStyles.indeterminate,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<svg
  viewBox="0 0 36 36"
  fill="none"
  aria-hidden="true"
  data-lenso-slot="progress-circle-track"
  {...rest}
  {...presentation}
>
  {@render children?.()}
</svg>
