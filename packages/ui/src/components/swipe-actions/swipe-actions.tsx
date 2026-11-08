"use client";
import {
  useId,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { useDirection } from "@base-ui/react/direction-provider";
import { useRender } from "@base-ui/react/use-render";
import * as stylex from "@stylexjs/stylex";
import { swipeActionsStyles as s } from "@lenso/tokens/swipe-actions";
import { assignRef } from "../../utils/interaction/ref.js";
import type { StyleXProps } from "../../utils/styled.js";

export type SwipeActionsSide = "start" | "end";
export interface SwipeAction {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "danger" | "tint";
  disabled?: boolean;
  /** Explicitly allow a full swipe to execute this action. First enabled opt-in wins. */
  fullSwipe?: boolean;
  onAction: () => void;
}
export type SwipeActionsProps = StyleXProps<useRender.ComponentProps<"div">> & {
  startActions?: readonly SwipeAction[];
  endActions?: readonly SwipeAction[];
  openSide?: SwipeActionsSide | null;
  defaultOpenSide?: SwipeActionsSide | null;
  onOpenSideChange?: (side: SwipeActionsSide | null) => void;
  disabled?: boolean;
  startActionsLabel?: string;
  endActionsLabel?: string;
};
type Gesture = {
  id: number;
  x: number;
  y: number;
  origin: number;
  axis: "x" | "y" | null;
  offset: number;
  time: number;
  velocity: number;
  lastX: number;
};
const EDITABLE = 'input,textarea,select,[contenteditable]:not([contenteditable="false"])';

export function SwipeActions({
  startActions = [],
  endActions = [],
  openSide,
  defaultOpenSide = null,
  onOpenSideChange,
  disabled = false,
  startActionsLabel = "Show leading actions",
  endActionsLabel = "Show trailing actions",
  children,
  ref,
  render,
  xstyle,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onClickCapture,
  onKeyDown,
  ...props
}: SwipeActionsProps) {
  const [localSide, setLocalSide] = useState(defaultOpenSide);
  const [pan, setPan] = useState<number | null>(null);
  const [extents, setExtents] = useState({ start: 0, end: 0 });
  const root = useRef<HTMLElement | null>(null);
  const start = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const suppressUntil = useRef(0);
  const returnFocus = useRef<SwipeActionsSide | null>(null);
  const direction = useDirection() === "rtl" ? -1 : 1;
  const bindRoot = useCallback(
    (node: HTMLElement | null) => {
      root.current = node;
      const preventSelection = (event: Event) => {
        const target =
          event.target instanceof Element
            ? event.target
            : event.target instanceof Node
              ? event.target.parentElement
              : null;
        if (!target?.closest(EDITABLE)) event.preventDefault();
      };
      node?.addEventListener("selectstart", preventSelection);
      const cleanup = assignRef(ref, node);
      return () => {
        node?.removeEventListener("selectstart", preventSelection);
        cleanup();
        if (root.current === node) root.current = null;
      };
    },
    [ref],
  );
  const id = useId();
  const requested = openSide === undefined ? localSide : openSide;
  const side =
    disabled ||
    (requested === "start"
      ? !startActions.length
      : requested === "end"
        ? !endActions.length
        : false)
      ? null
      : requested;
  const width = (edge: SwipeActionsSide) =>
    (edge === "start" ? start : end).current?.offsetWidth ?? 0;
  const offset = disabled ? 0 : (pan ?? (side ? extents[side] * (side === "start" ? 1 : -1) : 0));
  useLayoutEffect(() => {
    const measure = () => {
      const next = { start: start.current?.offsetWidth ?? 0, end: end.current?.offsetWidth ?? 0 };
      setExtents((previous) =>
        previous.start === next.start && previous.end === next.end ? previous : next,
      );
    };
    const resize = new ResizeObserver(measure);
    if (start.current) resize.observe(start.current);
    if (end.current) resize.observe(end.current);
    measure();
    return () => resize.disconnect();
  }, [startActions.length, endActions.length]);
  const change = (next: SwipeActionsSide | null) => {
    if (next === side) return;
    if (
      !next &&
      side &&
      root.current
        ?.querySelector(`[data-swipe-actions-side="${side}"]`)
        ?.contains(root.current.ownerDocument.activeElement)
    )
      returnFocus.current = side;
    if (openSide === undefined) setLocalSide(next);
    onOpenSideChange?.(next);
  };
  useLayoutEffect(() => {
    if (!side && returnFocus.current) {
      root.current
        ?.querySelector<HTMLElement>(`[data-swipe-trigger="${returnFocus.current}"]`)
        ?.focus({ preventScroll: true });
      returnFocus.current = null;
    }
  }, [side]);
  const actions = (edge: SwipeActionsSide, entries: readonly SwipeAction[]) =>
    entries.length ? (
      <div
        ref={edge === "start" ? start : end}
        id={`${id}-${edge}`}
        data-swipe-actions-side={edge}
        inert={disabled || side !== edge}
        aria-hidden={disabled || side !== edge}
        {...stylex.props(
          s.actions,
          edge === "start" ? s.start : s.end,
          (edge === "start" ? offset > 0 : offset < 0) && s.visible,
        )}
      >
        {entries.map((action) => (
          <BaseButton
            key={action.id}
            disabled={disabled || action.disabled}
            data-swipe-action=""
            {...stylex.props(
              s.action,
              action.variant === "danger" && s.danger,
              action.variant === "tint" && s.tint,
            )}
            onClick={() => {
              change(null);
              action.onAction();
            }}
          >
            {action.icon && <span aria-hidden="true">{action.icon}</span>}
            {action.label}
          </BaseButton>
        ))}
      </div>
    ) : null;
  const trigger = (edge: SwipeActionsSide, entries: readonly SwipeAction[]) =>
    entries.length ? (
      <BaseButton
        type="button"
        data-swipe-trigger={edge}
        disabled={disabled}
        aria-label={edge === "start" ? startActionsLabel : endActionsLabel}
        aria-expanded={side === edge}
        aria-controls={`${id}-${edge}`}
        {...stylex.props(s.trigger)}
        onClick={() => change(side === edge ? null : edge)}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" {...stylex.props(s.icon)}>
          <circle cx="4" cy="10" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="16" cy="10" r="1.5" />
        </svg>
      </BaseButton>
    ) : null;
  const finish = (cancel: boolean, timestamp: number) => {
    const session = gesture.current;
    gesture.current = null;
    setPan(null);
    if (!session || session.axis !== "x") return;
    suppressUntil.current = timestamp + 350;
    if (cancel || disabled) return;
    const edge = session.offset >= 0 ? "start" : "end";
    const entries = edge === "start" ? startActions : endActions;
    const full = entries.find((action) => action.fullSwipe && !action.disabled);
    if (full && Math.abs(session.offset) >= (root.current?.clientWidth ?? Infinity) * 0.8) {
      change(null);
      full.onAction();
    } else {
      const velocity = timestamp - session.time <= 100 ? session.velocity : 0;
      const projected = Math.max(
        0,
        (session.offset + velocity * 150) * (edge === "start" ? 1 : -1),
      );
      change(projected >= width(edge) / 2 && entries.length ? edge : null);
    }
  };
  const compiled = stylex.props(s.root, xstyle);
  return useRender({
    defaultTagName: "div",
    render,
    ref: bindRoot,
    props: {
      ...props,
      ...compiled,
      style: { ...compiled.style, ...style },
      "data-slot": "swipe-actions",
      "data-open-side": side ?? undefined,
      onPointerDown(event: PointerEvent<HTMLDivElement>) {
        onPointerDown?.(event);
        if (
          event.defaultPrevented ||
          disabled ||
          !event.isPrimary ||
          event.button !== 0 ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          (event.target as Element).closest(`${EDITABLE},[data-swipe-trigger],[data-swipe-action]`)
        )
          return;
        suppressUntil.current = 0;
        gesture.current = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          origin: offset,
          offset,
          axis: null,
          time: event.timeStamp,
          velocity: 0,
          lastX: event.clientX,
        };
      },
      onPointerMove(event: PointerEvent<HTMLDivElement>) {
        onPointerMove?.(event);
        if (disabled) {
          finish(true, event.timeStamp);
          return;
        }
        const session = gesture.current;
        if (event.defaultPrevented || !session || event.pointerId !== session.id) return;
        const dx = event.clientX - session.x;
        const dy = event.clientY - session.y;
        if (!session.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8)
          session.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (session.axis !== "x") return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const next = session.origin + dx * direction;
        const elapsed = event.timeStamp - session.time;
        if (elapsed > 0) session.velocity = ((event.clientX - session.lastX) * direction) / elapsed;
        session.lastX = event.clientX;
        session.time = event.timeStamp;
        const edge = next >= 0 ? "start" : "end";
        const entries = edge === "start" ? startActions : endActions;
        const extent = entries.some((action) => action.fullSwipe && !action.disabled)
          ? root.current!.clientWidth
          : width(edge);
        session.offset = entries.length
          ? Math.sign(next) *
            (Math.min(Math.abs(next), extent) + Math.max(0, Math.abs(next) - extent) / 4)
          : 0;
        setPan(session.offset);
      },
      onPointerUp(event: PointerEvent<HTMLDivElement>) {
        onPointerUp?.(event);
        if (gesture.current?.id === event.pointerId)
          finish(event.defaultPrevented, event.timeStamp);
      },
      onPointerCancel(event: PointerEvent<HTMLDivElement>) {
        onPointerCancel?.(event);
        if (gesture.current?.id === event.pointerId) finish(true, event.timeStamp);
      },
      onLostPointerCapture(event: PointerEvent<HTMLDivElement>) {
        onLostPointerCapture?.(event);
        // Touch implicitly captures the original child. Transferring capture to
        // this root bubbles the child's loss; only this root's own loss cancels.
        if (event.target === event.currentTarget && gesture.current?.id === event.pointerId)
          finish(true, event.timeStamp);
      },
      onClickCapture(event: MouseEvent<HTMLDivElement>) {
        onClickCapture?.(event);
        if (
          event.detail > 0 &&
          event.timeStamp < suppressUntil.current &&
          !(event.target as Element).closest("[data-swipe-action],[data-swipe-trigger]")
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        onKeyDown?.(event);
        if (!event.defaultPrevented && event.key === "Escape" && side) {
          event.preventDefault();
          change(null);
        }
      },
      children: (
        <>
          <div
            data-slot="swipe-actions-content"
            {...stylex.props(s.content, s.offset(offset * direction), pan !== null && s.dragging)}
          >
            {trigger("start", startActions)}
            <div data-slot="swipe-actions-body" {...stylex.props(s.body)}>
              {children}
            </div>
            {trigger("end", endActions)}
          </div>
          {actions("start", startActions)}
          {actions("end", endActions)}
        </>
      ),
    },
  });
}
