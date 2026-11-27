<script lang="ts">
  import { refreshControlStyles as s } from "@lenso/tokens/refresh-control";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { Spinner } from "../spinner/index.js";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import { getRefresh } from "./context.js";

  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const refresh = getRefresh();
  const visual = $derived(refresh.visual());
  const presentation = $derived(styled(s.viewport, xstyle, className, style));
</script>

<div data-lenso-slot="refresh-control-viewport" {...rest} {...presentation} {@attach refresh.bind}>
  <div aria-hidden="true" {...attributes(s.indicator, s.indicatorOffset(visual.distance))}>
    {#if visual.phase === "refreshing"}
      <Spinner size="sm" aria-hidden="true" />
    {:else}
      <span
        {...attributes(
          s.progress,
          s.progressValue(Math.min(1, visual.distance / refresh.threshold())),
        )}
      >
        ↓
      </span>
    {/if}
    <span>{refresh.message()}</span>
  </div>
  <div
    {...attributes(
      s.content,
      s.offset(visual.distance),
      (visual.phase === "pulling" || visual.phase === "armed") && s.dragging,
    )}
  >
    {@render children?.()}
  </div>
</div>
