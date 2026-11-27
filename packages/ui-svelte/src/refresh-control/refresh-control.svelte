<script module lang="ts">
  export type RefreshControlProps = SvelteHTMLElements["div"] &
    StyleXProps & {
      onRefresh: () => void | Promise<void>;
      onRefreshError?: (error: unknown) => void;
      disabled?: boolean;
      threshold?: number;
      refreshLabel?: string;
      pullLabel?: string;
      releaseLabel?: string;
      refreshingLabel?: string;
      completeLabel?: string;
      errorLabel?: string;
    };
</script>

<script lang="ts">
  import { refreshControlStyles as s } from "@lenso/tokens/refresh-control";
  import { onDestroy } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import { setRefresh, type RefreshVisual } from "./context.js";

  let {
    onRefresh,
    onRefreshError,
    disabled,
    threshold: distance,
    refreshLabel = "Refresh",
    pullLabel = "Pull to refresh",
    releaseLabel = "Release to refresh",
    refreshingLabel = "Refreshing",
    completeLabel = "Refresh complete",
    errorLabel = "Couldn't refresh. Try again.",
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: RefreshControlProps = $props();

  type Gesture = {
    identifier: number;
    x: number;
    y: number;
    start: TouchEvent;
    pulling: boolean;
    distance: number;
  };
  const ignore =
    'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[data-list-reorder],[data-list-selection],[data-swipe-action],[data-swipe-trigger]';
  let visual: RefreshVisual = $state.raw({ phase: "idle", distance: 0 });
  const threshold = () => (distance && Number.isFinite(distance) && distance > 0 ? distance : 72);
  const message = $derived(
    {
      idle: "",
      pulling: pullLabel,
      armed: releaseLabel,
      refreshing: refreshingLabel,
      complete: completeLabel,
      error: errorLabel,
    }[visual.phase],
  );
  const presentation = $derived(styled(s.root, xstyle, className, style));
  let mounted = true;
  let busy = false;
  let gesture: Gesture | undefined;
  let suppressUntil = 0;
  onDestroy(() => {
    mounted = false;
  });
  $effect(() => {
    if (disabled && gesture) {
      gesture = undefined;
      if (!busy) visual = { phase: "idle", distance: 0 };
    }
  });

  async function refresh() {
    if (disabled || busy) return;
    busy = true;
    gesture = undefined;
    visual = { phase: "refreshing", distance: 56 };
    try {
      await onRefresh();
      if (mounted) visual = { phase: "complete", distance: 0 };
    } catch (error) {
      if (mounted) {
        visual = { phase: "error", distance: 0 };
        onRefreshError?.(error);
      }
    } finally {
      busy = false;
    }
  }

  function bind(node: HTMLDivElement) {
    function start(event: TouchEvent) {
      if (
        disabled ||
        busy ||
        event.defaultPrevented ||
        event.touches.length !== 1 ||
        node.scrollTop > 0 ||
        (event.target instanceof Element && event.target.closest(ignore))
      )
        return;
      const touch = event.touches[0]!;
      gesture = {
        identifier: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        start: event,
        pulling: false,
        distance: 0,
      };
    }

    function cancel() {
      if (gesture?.pulling && !busy) visual = { phase: "idle", distance: 0 };
      gesture = undefined;
    }

    function move(event: TouchEvent) {
      const active = gesture;
      if (!active) return;
      const touch = event.touches[0];
      if (
        event.touches.length !== 1 ||
        touch?.identifier !== active.identifier ||
        disabled ||
        active.start.defaultPrevented
      ) {
        cancel();
        return;
      }
      const dx = touch.clientX - active.x;
      const dy = touch.clientY - active.y;
      if (!active.pulling) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) <= 8) return;
        if (dy <= 0 || Math.abs(dx) >= Math.abs(dy)) {
          cancel();
          return;
        }
        active.pulling = true;
      }
      if (event.defaultPrevented || !event.cancelable) {
        cancel();
        return;
      }
      event.preventDefault();
      active.distance = Math.min(threshold() + 40, Math.max(0, dy) * 0.5);
      visual = {
        phase: active.distance >= threshold() ? "armed" : "pulling",
        distance: active.distance,
      };
    }

    function end(event: TouchEvent) {
      const active = gesture;
      if (
        !active ||
        ![...event.changedTouches].some((touch) => touch.identifier === active.identifier)
      )
        return;
      if (active.pulling) suppressUntil = event.timeStamp + 350;
      if (event.type === "touchend" && !event.defaultPrevented && active.distance >= threshold())
        void refresh();
      else cancel();
    }

    function click(event: MouseEvent) {
      if (event.detail > 0 && event.timeStamp < suppressUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    node.addEventListener("touchstart", start, { passive: true });
    node.addEventListener("touchmove", move, { passive: false });
    node.addEventListener("touchend", end);
    node.addEventListener("touchcancel", end);
    node.addEventListener("click", click, true);
    return () => {
      cancel();
      node.removeEventListener("touchstart", start);
      node.removeEventListener("touchmove", move);
      node.removeEventListener("touchend", end);
      node.removeEventListener("touchcancel", end);
      node.removeEventListener("click", click, true);
    };
  }

  setRefresh({
    visual: () => visual,
    threshold,
    label: () => refreshLabel,
    message: () => message,
    disabled: () => Boolean(disabled),
    refresh,
    bind,
  });
</script>

<div
  data-lenso-slot="refresh-control"
  {...rest}
  {...presentation}
  data-state={visual.phase}
  aria-busy={visual.phase === "refreshing" || undefined}
>
  {@render children?.()}
  {#if visual.phase === "error"}<p {...attributes(s.error)}>{errorLabel}</p>{/if}
</div>
<output aria-live="polite" aria-atomic="true" {...attributes(s.srOnly)}>
  {#if visual.phase !== "pulling"}{message}{/if}
</output>
