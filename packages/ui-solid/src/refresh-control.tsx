import { refreshControlStyles as s } from "@lenso/tokens/refresh-control";
import { Button } from "@ui-sdk/solid/button";
import {
  createContext,
  createEffect,
  createSignal,
  omit,
  onCleanup,
  useContext,
  type ComponentProps,
} from "solid-js";
import { attributes, htmlPart, sdkPart, type StyledPart } from "./parts.js";
import { Spinner } from "./spinner.jsx";

type Phase = "idle" | "pulling" | "armed" | "refreshing" | "complete" | "error";
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
const Root = htmlPart("div", "refresh-control", () => s.root);
const Viewport = htmlPart("div", "refresh-control-viewport", () => s.viewport);
const Trigger: StyledPart<typeof Button> = sdkPart(
  Button,
  "refresh-control-trigger",
  (props) => !props.render && s.trigger,
);
const Context = createContext<{
  visual: () => { phase: Phase; distance: number };
  threshold: () => number;
  label: () => string;
  message: () => string;
  disabled: () => boolean;
  refresh: () => Promise<void>;
  bind: (node: HTMLDivElement) => () => void;
}>();

function useRefresh() {
  const value = useContext(Context);
  if (!value) throw new Error("RefreshControl parts require RefreshControl.Root");
  return value;
}

export type RefreshControlProps = ComponentProps<typeof Root> & {
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

export function RefreshControlRoot(props: RefreshControlProps) {
  const [visual, setVisual] = createSignal<{ phase: Phase; distance: number }>({
    phase: "idle",
    distance: 0,
  });
  const threshold = () =>
    props.threshold && Number.isFinite(props.threshold) && props.threshold > 0
      ? props.threshold
      : 72;
  const errorLabel = () => props.errorLabel ?? "Couldn't refresh. Try again.";
  const message = () =>
    ({
      idle: "",
      pulling: props.pullLabel ?? "Pull to refresh",
      armed: props.releaseLabel ?? "Release to refresh",
      refreshing: props.refreshingLabel ?? "Refreshing",
      complete: props.completeLabel ?? "Refresh complete",
      error: errorLabel(),
    })[visual().phase];

  let mounted = true;
  let busy = false;
  let gesture: Gesture | undefined;
  let suppressUntil = 0;
  onCleanup(() => {
    mounted = false;
  });
  createEffect(
    () => props.disabled,
    (disabled) => {
      if (disabled && gesture) {
        gesture = undefined;
        if (!busy) setVisual({ phase: "idle", distance: 0 });
      }
    },
  );

  async function refresh() {
    if (props.disabled || busy) return;
    busy = true;
    gesture = undefined;
    setVisual({ phase: "refreshing", distance: 56 });
    try {
      await props.onRefresh();
      if (mounted) setVisual({ phase: "complete", distance: 0 });
    } catch (error) {
      if (mounted) {
        setVisual({ phase: "error", distance: 0 });
        props.onRefreshError?.(error);
      }
    } finally {
      busy = false;
    }
  }

  function bind(node: HTMLDivElement) {
    function start(event: TouchEvent) {
      if (
        props.disabled ||
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
      if (gesture?.pulling && !busy) setVisual({ phase: "idle", distance: 0 });
      gesture = undefined;
    }

    function move(event: TouchEvent) {
      const active = gesture;
      if (!active) return;
      const touch = event.touches[0];
      if (
        event.touches.length !== 1 ||
        touch?.identifier !== active.identifier ||
        props.disabled ||
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
      setVisual({
        phase: active.distance >= threshold() ? "armed" : "pulling",
        distance: active.distance,
      });
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

  return (
    <Context
      value={{
        visual,
        threshold,
        label: () => props.refreshLabel ?? "Refresh",
        message,
        disabled: () => Boolean(props.disabled),
        refresh,
        bind,
      }}
    >
      <Root
        {...omit(
          props,
          "threshold",
          "disabled",
          "onRefresh",
          "onRefreshError",
          "refreshLabel",
          "pullLabel",
          "releaseLabel",
          "refreshingLabel",
          "completeLabel",
          "errorLabel",
          "children",
        )}
        data-state={visual().phase}
        aria-busy={visual().phase === "refreshing" ? "true" : undefined}
      >
        {props.children}
        {visual().phase === "error" && <p {...attributes(s.error)}>{errorLabel()}</p>}
      </Root>
      <output aria-live="polite" aria-atomic="true" {...attributes(s.srOnly)}>
        {visual().phase !== "pulling" && message()}
      </output>
    </Context>
  );
}

export function RefreshControlViewport(props: ComponentProps<typeof Viewport>) {
  const refresh = useRefresh();
  const [node, setNode] = createSignal<HTMLDivElement>();
  createEffect(
    () => node(),
    (element) => {
      return element ? refresh.bind(element) : undefined;
    },
  );
  const phase = () => refresh.visual().phase;
  const distance = () => refresh.visual().distance;
  return (
    <Viewport {...omit(props, "ref", "children")} ref={[setNode, props.ref]}>
      <div aria-hidden="true" {...attributes(s.indicator, s.indicatorOffset(distance()))}>
        {phase() === "refreshing" ? (
          <Spinner size="sm" aria-hidden="true" />
        ) : (
          <span
            {...attributes(
              s.progress,
              s.progressValue(Math.min(1, distance() / refresh.threshold())),
            )}
          >
            ↓
          </span>
        )}
        <span>{refresh.message()}</span>
      </div>
      <div
        {...attributes(
          s.content,
          s.offset(distance()),
          (phase() === "pulling" || phase() === "armed") && s.dragging,
        )}
      >
        {props.children}
      </div>
    </Viewport>
  );
}

export type RefreshControlTriggerProps = ComponentProps<typeof Trigger>;
export function RefreshControlTrigger(props: RefreshControlTriggerProps) {
  const refresh = useRefresh();
  return (
    <Trigger
      {...omit(props, "disabled", "onClick", "children")}
      disabled={props.disabled || refresh.disabled() || refresh.visual().phase === "refreshing"}
      onClick={(event, details) => {
        const listener = props.onClick;
        if (typeof listener === "function") listener(event, details);
        else listener?.[0](listener[1], event, details);
        if (!event.defaultPrevented) return refresh.refresh();
      }}
    >
      {props.children ?? refresh.label()}
    </Trigger>
  );
}

export const RefreshControl: typeof RefreshControlRoot & {
  Root: typeof RefreshControlRoot;
  Viewport: typeof RefreshControlViewport;
  Trigger: typeof RefreshControlTrigger;
} = Object.assign(RefreshControlRoot, {
  Root: RefreshControlRoot,
  Viewport: RefreshControlViewport,
  Trigger: RefreshControlTrigger,
});
