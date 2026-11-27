<script lang="ts">
  import { bindPillMarquee } from "@lenso/glass/motion";
  import { scrollShadowStyles as shadow } from "@lenso/tokens/scroll-shadow";
  import { toastStyles as s } from "@lenso/tokens/toast";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { attributes, styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  let viewport: HTMLSpanElement | undefined = $state();
  let text: HTMLSpanElement | undefined = $state();
  const presentation = $derived(
    styled(
      [
        shadow.root,
        shadow.horizontal,
        shadow.horizontalTimeline,
        shadow.hideScrollBar,
        shadow.automatic,
        shadow.horizontalMask,
        s.marquee,
      ],
      xstyle,
      className,
      style,
    ),
  );
  $effect(() => {
    if (viewport && text) return bindPillMarquee(viewport, text);
  });
</script>

<span data-lenso-slot="toast-marquee" {...rest} {...presentation} bind:this={viewport}>
  <span bind:this={text} {...attributes(s.marqueeText)}>{@render children?.()}</span>
</span>
