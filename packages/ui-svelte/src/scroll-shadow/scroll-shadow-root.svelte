<script lang="ts">
  import { scrollShadowStyles } from "@lenso/tokens/scroll-shadow";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    orientation,
    hideScrollBar,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["div"], "orientation" | "hideScrollBar"> &
    StyleXProps & { orientation?: "horizontal" | "vertical"; hideScrollBar?: boolean } = $props();
  const presentation = $derived(
    styled(
      [
        scrollShadowStyles.root,
        scrollShadowStyles[orientation ?? "vertical"],
        orientation === "horizontal"
          ? scrollShadowStyles.horizontalTimeline
          : scrollShadowStyles.verticalTimeline,
        hideScrollBar && scrollShadowStyles.hideScrollBar,
        scrollShadowStyles.automatic,
        orientation === "horizontal"
          ? scrollShadowStyles.horizontalMask
          : scrollShadowStyles.verticalMask,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<div data-lenso-slot="scroll-shadow" {...rest} {...presentation}>
  {@render children?.()}
</div>
