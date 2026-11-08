"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import * as stylex from "@stylexjs/stylex";
import { refreshControlStyles as s } from "@lenso/tokens/refresh-control";
import { Button as BaseButton } from "@base-ui/react/button";
import { Spinner } from "../spinner/index.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

type Phase = "idle" | "pulling" | "armed" | "refreshing" | "complete" | "error";
type TouchSession = {
  id: number;
  x: number;
  y: number;
  start: TouchEvent;
  axis: "x" | "y" | null;
  distance: number;
};
const ignorePull =
  'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[data-list-reorder],[data-list-selection],[data-swipe-action],[data-swipe-trigger]';
const Context = createContext<{
  phase: Phase;
  distance: number;
  progress: number;
  disabled: boolean;
  label: string;
  message: string;
  suppressClick: (timestamp: number, detail: number) => boolean;
  refresh: () => void;
  start: (event: TouchEvent) => void;
  move: (event: TouchEvent) => void;
  end: (event: TouchEvent) => void;
} | null>(null);
function useRefresh() {
  const context = useContext(Context);
  if (!context) throw new Error("RefreshControl parts require RefreshControl.Root");
  return context;
}
export type RefreshControlRootProps = StyleXProps<ComponentProps<"div">> & {
  onRefresh: () => void | Promise<void>;
  onRefreshError?: (error: unknown) => void;
  disabled?: boolean;
  /** Resisted pull distance in CSS pixels. Must be positive. */
  threshold?: number;
  refreshLabel?: string;
  pullLabel?: string;
  releaseLabel?: string;
  refreshingLabel?: string;
  completeLabel?: string;
  errorLabel?: string;
};
export function RefreshControlRoot({
  onRefresh,
  onRefreshError,
  disabled = false,
  threshold = 72,
  refreshLabel = "Refresh",
  pullLabel = "Pull to refresh",
  releaseLabel = "Release to refresh",
  refreshingLabel = "Refreshing",
  completeLabel = "Refresh complete",
  errorLabel = "Couldn't refresh. Try again.",
  children,
  xstyle,
  style,
  ...props
}: RefreshControlRootProps) {
  const [visual, setVisual] = useState<{ phase: Phase; distance: number }>({
    phase: "idle",
    distance: 0,
  });
  const busy = useRef(false);
  const mounted = useRef(true);
  const gesture = useRef<TouchSession | null>(null);
  const suppressUntil = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (disabled) {
      gesture.current = null;
      if (!busy.current) setVisual({ phase: "idle", distance: 0 });
    }
  }, [disabled]);
  const refresh = useCallback(async () => {
    if (disabled || busy.current) return;
    busy.current = true;
    gesture.current = null;
    setVisual({ phase: "refreshing", distance: 56 });
    try {
      await onRefresh();
      if (mounted.current) setVisual({ phase: "complete", distance: 0 });
    } catch (error) {
      if (mounted.current) {
        setVisual({ phase: "error", distance: 0 });
        onRefreshError?.(error);
      }
    } finally {
      busy.current = false;
    }
  }, [disabled, onRefresh, onRefreshError]);
  const start = useCallback(
    (event: TouchEvent) => {
      const view = event.currentTarget as HTMLElement;
      if (
        disabled ||
        busy.current ||
        event.defaultPrevented ||
        event.touches.length !== 1 ||
        view.scrollTop > 0 ||
        (event.target instanceof Element && event.target.closest(ignorePull))
      )
        return;
      const touch = event.touches[0]!;
      gesture.current = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        start: event,
        axis: null,
        distance: 0,
      };
    },
    [disabled],
  );
  const move = useCallback(
    (event: TouchEvent) => {
      const active = gesture.current;
      if (!active) return;
      const touch = [...event.touches].find((touch) => touch.identifier === active.id);
      if (!touch || event.touches.length !== 1 || disabled || active.start.defaultPrevented) {
        gesture.current = null;
        if (!busy.current) setVisual({ phase: "idle", distance: 0 });
        return;
      }
      const dx = touch.clientX - active.x,
        dy = touch.clientY - active.y;
      if (!active.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
        if (dy <= 0 || Math.abs(dx) >= Math.abs(dy)) {
          gesture.current = null;
          return;
        }
        active.axis = "y";
      }
      if (active.axis !== "y") return;
      if (event.defaultPrevented || !event.cancelable) {
        gesture.current = null;
        setVisual({ phase: "idle", distance: 0 });
        return;
      }
      event.preventDefault();
      active.distance = Math.min(threshold + 40, Math.max(0, dy) * 0.5);
      setVisual({
        phase: active.distance >= threshold ? "armed" : "pulling",
        distance: active.distance,
      });
    },
    [disabled, threshold],
  );
  const end = useCallback(
    (event: TouchEvent) => {
      const active = gesture.current;
      if (!active || ![...event.changedTouches].some((touch) => touch.identifier === active.id))
        return;
      gesture.current = null;
      if (active.axis === "y") suppressUntil.current = event.timeStamp + 350;
      if (event.type !== "touchcancel" && !event.defaultPrevented && active.distance >= threshold)
        void refresh();
      else if (!busy.current && active.axis === "y") setVisual({ phase: "idle", distance: 0 });
    },
    [threshold, refresh],
  );
  const message = {
    idle: "",
    pulling: pullLabel,
    armed: releaseLabel,
    refreshing: refreshingLabel,
    complete: completeLabel,
    error: errorLabel,
  }[visual.phase];
  const compiled = stylex.props(s.root, xstyle);
  return (
    <Context
      value={{
        ...visual,
        progress: Math.min(1, visual.distance / threshold),
        disabled,
        label: refreshLabel,
        message,
        refresh: () => {
          void refresh();
        },
        start,
        move,
        end,
        suppressClick: (timestamp, detail) => detail > 0 && timestamp < suppressUntil.current,
      }}
    >
      <div
        {...props}
        {...compiled}
        style={{ ...compiled.style, ...style }}
        data-slot="refresh-control"
        data-state={visual.phase}
        aria-busy={visual.phase === "refreshing" || undefined}
      >
        {children}
        {visual.phase === "error" && <p {...stylex.props(s.error)}>{errorLabel}</p>}
      </div>
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Refresh announcements are not form-associated output values. */}
      <span role="status" aria-live="polite" aria-atomic="true" {...stylex.props(s.srOnly)}>
        {visual.phase === "armed" ||
        visual.phase === "refreshing" ||
        visual.phase === "error" ||
        visual.phase === "complete"
          ? message
          : ""}
      </span>
    </Context>
  );
}
export type RefreshControlViewportProps = StyleXProps<ComponentProps<"div">>;
export function RefreshControlViewport({
  ref,
  children,
  xstyle,
  style,
  onClickCapture,
  ...props
}: RefreshControlViewportProps) {
  const { phase, distance, progress, message, start, move, end, suppressClick } = useRefresh();
  const view = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRefs(view, ref);
  useEffect(() => {
    const node = view.current!;
    node.addEventListener("touchstart", start, { passive: true });
    node.addEventListener("touchmove", move, { passive: false });
    node.addEventListener("touchend", end);
    node.addEventListener("touchcancel", end);
    return () => {
      node.removeEventListener("touchstart", start);
      node.removeEventListener("touchmove", move);
      node.removeEventListener("touchend", end);
      node.removeEventListener("touchcancel", end);
    };
  }, [start, move, end]);
  const compiled = stylex.props(s.viewport, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      ref={mergedRef}
      style={{ ...compiled.style, ...style }}
      data-slot="refresh-control-viewport"
      onClickCapture={(event) => {
        onClickCapture?.(event);
        if (suppressClick(event.timeStamp, event.detail)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <div aria-hidden="true" {...stylex.props(s.indicator, s.indicatorOffset(distance))}>
        {phase === "refreshing" ? (
          <Spinner size="sm" aria-hidden="true" />
        ) : (
          <span {...stylex.props(s.progress, s.progressValue(progress))}>↓</span>
        )}
        <span>{message}</span>
      </div>
      <div
        {...stylex.props(
          s.content,
          s.offset(distance),
          (phase === "pulling" || phase === "armed") && s.dragging,
        )}
      >
        {children}
      </div>
    </div>
  );
}
export type RefreshControlTriggerProps = StyleXProps<ComponentProps<typeof BaseButton>>;
export function RefreshControlTrigger({
  children,
  onClick,
  disabled,
  render,
  xstyle,
  style,
  ...props
}: RefreshControlTriggerProps) {
  const context = useRefresh();
  const compiled = stylex.props(!render && s.trigger, xstyle);
  return (
    <BaseButton
      {...props}
      {...compiled}
      render={render}
      style={mergeStyle(compiled.style, style)}
      disabled={disabled || context.disabled || context.phase === "refreshing"}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.refresh();
      }}
    >
      {children ?? context.label}
    </BaseButton>
  );
}
export const RefreshControl = Object.assign(RefreshControlRoot, {
  Root: RefreshControlRoot,
  Viewport: RefreshControlViewport,
  Trigger: RefreshControlTrigger,
});
export type RefreshControlProps = RefreshControlRootProps;
