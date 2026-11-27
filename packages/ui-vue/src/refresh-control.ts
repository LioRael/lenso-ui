import { refreshControlStyles as s } from "@lenso/tokens/refresh-control";
import * as stylex from "@stylexjs/stylex";
import { Button, type ButtonActionDetails } from "@ui-sdk/vue/button";
import {
  defineComponent,
  h,
  inject,
  onScopeDispose,
  provide,
  shallowRef,
  watch,
  watchPostEffect,
  type HTMLAttributes,
  type InjectionKey,
  type PropType,
} from "vue";
import { partAttributes, sdkPart, type ComponentProps, type StyledPart } from "./parts.js";
import { Spinner } from "./spinner.js";

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

type RefreshOptions = {
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

function createRefresh(props: RefreshOptions) {
  const state = shallowRef<{ phase: Phase; distance: number }>({
    phase: "idle",
    distance: 0,
  });
  const visual = () => state.value;
  const setVisual = (value: { phase: Phase; distance: number }) => {
    state.value = value;
  };
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
  onScopeDispose(() => {
    mounted = false;
  });
  watch(
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

  return {
    visual,
    threshold,
    errorLabel,
    label: () => props.refreshLabel ?? "Refresh",
    message,
    disabled: () => Boolean(props.disabled),
    refresh,
    bind,
  };
}
const Context: InjectionKey<ReturnType<typeof createRefresh>> = Symbol("RefreshControl");
function useRefresh() {
  const value = inject(Context, undefined);
  if (!value) throw new Error("RefreshControl parts require RefreshControl.Root");
  return value;
}

const Root = defineComponent({
  name: "LensoRefreshControl",
  inheritAttrs: false,
  props: {
    onRefresh: { type: Function as PropType<() => void | Promise<void>>, required: true },
    onRefreshError: Function as PropType<(error: unknown) => void>,
    disabled: Boolean,
    threshold: Number,
    refreshLabel: String,
    pullLabel: String,
    releaseLabel: String,
    refreshingLabel: String,
    completeLabel: String,
    errorLabel: String,
  },
  setup(props, { attrs, slots }) {
    const refresh = createRefresh(props);
    provide(Context, refresh);
    return () => {
      const phase = refresh.visual().phase;
      return [
        h(
          "div",
          partAttributes("refresh-control", s.root, {
            ...attrs,
            "data-state": phase,
            "aria-busy": phase === "refreshing" ? "true" : undefined,
          }),
          [
            slots["default"]?.(),
            phase === "error" && h("p", stylex.attrs(s.error), refresh.errorLabel()),
          ],
        ),
        h(
          "output",
          {
            ...stylex.attrs(s.srOnly),
            "aria-live": "polite",
            "aria-atomic": "true",
          },
          phase === "pulling" ? "" : refresh.message(),
        ),
      ];
    };
  },
});
export const RefreshControlRoot: StyledPart<typeof Root, HTMLAttributes> =
  Root as unknown as StyledPart<typeof Root, HTMLAttributes>;
export type RefreshControlProps = ComponentProps<typeof RefreshControlRoot>;

const Viewport = defineComponent({
  name: "LensoRefreshControlViewport",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const refresh = useRefresh();
    const node = shallowRef<HTMLDivElement>();
    watchPostEffect((cleanup) => {
      if (node.value) cleanup(refresh.bind(node.value));
    });
    return () => {
      const { phase, distance } = refresh.visual();
      return h(
        "div",
        { ...partAttributes("refresh-control-viewport", s.viewport, attrs), ref: node },
        [
          h(
            "div",
            {
              ...stylex.attrs(s.indicator, s.indicatorOffset(distance)),
              "aria-hidden": "true",
            },
            [
              phase === "refreshing"
                ? h(Spinner, { size: "sm", "aria-hidden": "true" })
                : h(
                    "span",
                    stylex.attrs(
                      s.progress,
                      s.progressValue(Math.min(1, distance / refresh.threshold())),
                    ),
                    "↓",
                  ),
              h("span", refresh.message()),
            ],
          ),
          h(
            "div",
            stylex.attrs(
              s.content,
              s.offset(distance),
              (phase === "pulling" || phase === "armed") && s.dragging,
            ),
            slots["default"]?.(),
          ),
        ],
      );
    };
  },
});
export const RefreshControlViewport: StyledPart<typeof Viewport, HTMLAttributes> =
  Viewport as unknown as StyledPart<typeof Viewport, HTMLAttributes>;

const Trigger: StyledPart<typeof Button> = sdkPart(
  Button,
  "refresh-control-trigger",
  () => s.trigger,
);
export const RefreshControlTrigger: typeof Trigger = defineComponent({
  name: "LensoRefreshControlTrigger",
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    onClick: Function as PropType<ComponentProps<typeof Trigger>["onClick"]>,
  },
  setup(props, { attrs, slots }) {
    const refresh = useRefresh();
    return () =>
      h(
        Trigger,
        {
          ...attrs,
          disabled: props.disabled || refresh.disabled() || refresh.visual().phase === "refreshing",
          onClick: (event: MouseEvent, details: ButtonActionDetails) => {
            props.onClick?.(event, details);
            if (!event.defaultPrevented) return refresh.refresh();
          },
        },
        { ...slots, default: slots["default"] ?? (() => refresh.label()) },
      );
  },
}) as unknown as typeof Trigger;
export type RefreshControlTriggerProps = ComponentProps<typeof RefreshControlTrigger>;

export const RefreshControl: typeof RefreshControlRoot & {
  Root: typeof RefreshControlRoot;
  Viewport: typeof RefreshControlViewport;
  Trigger: typeof RefreshControlTrigger;
} = Object.assign(RefreshControlRoot, {
  Root: RefreshControlRoot,
  Viewport: RefreshControlViewport,
  Trigger: RefreshControlTrigger,
});
