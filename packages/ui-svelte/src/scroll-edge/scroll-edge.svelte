<script module lang="ts">
  export type ScrollEdgeProps = SvelteHTMLElements["div"] &
    StyleXProps & {
      variant?: "soft" | "hard";
      edge?: ScrollEdgeSide;
      scrollRef?: HTMLElement | null;
      fadeStart?: number;
    };
</script>

<script lang="ts">
  import {
    bindScrollEdge,
    softEdgeBands,
    softEdgeMask,
    createSoftEdgeTintMask,
    type ScrollEdgeSide,
  } from "@lenso/glass/motion";
  import { materialStyles as s } from "@lenso/tokens/materials";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  let {
    variant = "soft",
    edge = "top",
    scrollRef,
    fadeStart = 0,
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: ScrollEdgeProps = $props();
  let node: HTMLDivElement | undefined = $state();
  $effect(() => {
    if (node && scrollRef) return bindScrollEdge(node, scrollRef, edge);
  });
  const presentation = $derived(
    styled(
      [
        s.edge,
        variant === "soft" && s.soft,
        variant === "hard" && s.hard,
        variant === "hard" &&
          {
            top: s.hardTop,
            bottom: s.hardBottom,
            "inline-start": s.hardInlineStart,
            "inline-end": s.hardInlineEnd,
          }[edge],
        s[edge],
        s.edgeAccessible,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<div
  {...rest}
  {...presentation}
  bind:this={node}
  aria-hidden="true"
  data-lenso-slot="scroll-edge"
  data-scroll-bound={scrollRef ? "" : undefined}
  data-edge={edge}
  data-variant={variant}
>
  {#if variant === "soft"}
    {#each softEdgeBands as band (band.blur)}
      <span
        {...attributes(
          s.softLayer,
          s.softProgressive(
            band.blur,
            fadeStart ? softEdgeMask(band.start, band.end, 1, fadeStart) : band.mask,
          ),
        )}
      ></span>
    {/each}
    <span {...attributes(s.softLayer, s.softTint, s.softMask(createSoftEdgeTintMask(fadeStart)))}
    ></span>
  {:else}{@render children?.()}{/if}
</div>
