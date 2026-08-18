"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

export type ResizeHandleOrientation = "horizontal" | "vertical";
export type ResizeHandleChangeReason = "keyboard" | "pointer";
export type ResizeHandleInputEvent =
  | React.KeyboardEvent<HTMLElement>
  | React.PointerEvent<HTMLElement>;

export interface ResizeHandleChangeDetails {
  delta: number;
  event: ResizeHandleInputEvent;
  reason: ResizeHandleChangeReason;
  value: number;
}

export type ResizeHandleState = {
  disabled: boolean;
  dragging: boolean;
  orientation: ResizeHandleOrientation;
  value: number;
};

type ResizeHandleElementProps = Omit<
  useRender.ComponentProps<"div", ResizeHandleState>,
  | "aria-controls"
  | "aria-disabled"
  | "aria-orientation"
  | "aria-valuemax"
  | "aria-valuemin"
  | "aria-valuenow"
  | "className"
  | "ref"
  | "role"
  | "tabIndex"
>;

export type ResizeHandleProps = ResizeHandleElementProps & {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-controls": string;
  className?: string | ((state: ResizeHandleState) => string | undefined);
  disabled?: boolean;
  inverted?: boolean;
  max: number;
  min: number;
  onCollapseToggle?: (
    event: React.KeyboardEvent<HTMLElement> | React.MouseEvent<HTMLElement>,
  ) => void;
  onValueChange: (value: number, details: ResizeHandleChangeDetails) => void;
  onValueCommit?: (value: number, details: ResizeHandleChangeDetails) => void;
  orientation?: ResizeHandleOrientation;
  ref?: React.Ref<HTMLElement>;
  step?: number;
  value: number;
};

interface PointerDragState {
  lastValue: number;
  moved: boolean;
  pointerId: number;
  startCoordinate: number;
  startValue: number;
  target: HTMLElement;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function coordinate(event: React.PointerEvent<HTMLElement>, orientation: ResizeHandleOrientation) {
  return orientation === "vertical" ? event.clientX : event.clientY;
}

/**
 * A layout-independent, focusable window splitter.
 *
 * Consumers own pane layout and persistence. The handle owns pointer capture,
 * keyboard adjustment, bounded values, and WAI-ARIA separator semantics.
 */
export function ResizeHandle({
  className,
  disabled = false,
  inverted = false,
  max,
  min,
  onCollapseToggle,
  onValueChange,
  onValueCommit,
  orientation = "vertical",
  ref,
  render,
  step = 16,
  value,
  ...props
}: ResizeHandleProps) {
  const elementRef = React.useRef<HTMLElement>(null);
  const dragRef = React.useRef<PointerDragState | null>(null);
  const restoreDocumentRef = React.useRef<(() => void) | null>(null);
  const suppressClickRef = React.useRef(false);
  const [dragging, setDragging] = React.useState(false);
  const lowerBound = Math.min(min, max);
  const upperBound = Math.max(min, max);
  const currentValue = clamp(value, lowerBound, upperBound);
  const normalizedStep = Math.max(1, Math.abs(step));
  const state = React.useMemo<ResizeHandleState>(
    () => ({ disabled, dragging, orientation, value: currentValue }),
    [currentValue, disabled, dragging, orientation],
  );

  const restoreDocumentInteraction = React.useCallback(() => {
    restoreDocumentRef.current?.();
    restoreDocumentRef.current = null;
  }, []);

  React.useEffect(() => restoreDocumentInteraction, [restoreDocumentInteraction]);

  function createDetails(
    nextValue: number,
    previousValue: number,
    reason: ResizeHandleChangeReason,
    event: ResizeHandleInputEvent,
  ): ResizeHandleChangeDetails {
    return {
      delta: nextValue - previousValue,
      event,
      reason,
      value: nextValue,
    };
  }

  function changeValue(
    nextValue: number,
    previousValue: number,
    reason: ResizeHandleChangeReason,
    event: ResizeHandleInputEvent,
    commit: boolean,
  ) {
    const boundedValue = clamp(nextValue, lowerBound, upperBound);
    const details = createDetails(boundedValue, previousValue, reason, event);
    if (boundedValue !== previousValue) onValueChange(boundedValue, details);
    if (commit) onValueCommit?.(boundedValue, details);
    return boundedValue;
  }

  function finishPointerDrag(event: React.PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    dragRef.current = null;
    suppressClickRef.current = drag.moved;
    setDragging(false);
    restoreDocumentInteraction();
    const details = createDetails(drag.lastValue, drag.startValue, "pointer", event);
    onValueCommit?.(drag.lastValue, details);

    if (drag.target.hasPointerCapture(event.pointerId)) {
      drag.target.releasePointerCapture(event.pointerId);
    }
  }

  const internalProps: React.ComponentPropsWithRef<"div"> = {
    onClick(event) {
      if (disabled) return;
      if (suppressClickRef.current) {
        suppressClickRef.current = false;
        return;
      }
      onCollapseToggle?.(event);
    },
    onKeyDown(event) {
      if (disabled) return;

      let nextValue: number | undefined;
      const direction = inverted ? -1 : 1;
      if (orientation === "vertical") {
        if (event.key === "ArrowLeft") nextValue = currentValue - normalizedStep * direction;
        if (event.key === "ArrowRight") nextValue = currentValue + normalizedStep * direction;
      } else {
        if (event.key === "ArrowUp") nextValue = currentValue - normalizedStep * direction;
        if (event.key === "ArrowDown") nextValue = currentValue + normalizedStep * direction;
      }

      if (event.key === "Home") nextValue = lowerBound;
      if (event.key === "End") nextValue = upperBound;
      if (event.key === "Enter" && onCollapseToggle) {
        event.preventDefault();
        onCollapseToggle(event);
        return;
      }
      if (nextValue === undefined) return;

      event.preventDefault();
      changeValue(nextValue, currentValue, "keyboard", event, true);
    },
    onLostPointerCapture(event) {
      finishPointerDrag(event);
    },
    onPointerCancel(event) {
      finishPointerDrag(event);
    },
    onPointerDown(event) {
      if (disabled || event.button !== 0) return;
      event.preventDefault();
      event.currentTarget.focus({ preventScroll: true });

      dragRef.current = {
        lastValue: currentValue,
        moved: false,
        pointerId: event.pointerId,
        startCoordinate: coordinate(event, orientation),
        startValue: currentValue,
        target: event.currentTarget,
      };
      setDragging(true);

      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Synthetic pointer events do not always create an active pointer.
      }

      const body = event.currentTarget.ownerDocument.body;
      const previousCursor = body.style.cursor;
      const previousUserSelect = body.style.userSelect;
      body.style.cursor = orientation === "vertical" ? "col-resize" : "row-resize";
      body.style.userSelect = "none";
      restoreDocumentRef.current = () => {
        body.style.cursor = previousCursor;
        body.style.userSelect = previousUserSelect;
      };
    },
    onPointerMove(event) {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      event.preventDefault();
      const physicalDelta = coordinate(event, orientation) - drag.startCoordinate;
      drag.moved ||= Math.abs(physicalDelta) >= 3;
      const valueDelta = physicalDelta * (inverted ? -1 : 1);
      const nextValue = clamp(drag.startValue + valueDelta, lowerBound, upperBound);
      if (nextValue === drag.lastValue) return;
      const previousValue = drag.lastValue;
      drag.lastValue = nextValue;
      changeValue(nextValue, previousValue, "pointer", event, false);
    },
    onPointerUp(event) {
      finishPointerDrag(event);
    },
  };

  const protectedProps: React.ComponentPropsWithRef<"div"> = {
    "aria-controls": props["aria-controls"],
    "aria-disabled": disabled || undefined,
    "aria-orientation": orientation,
    "aria-valuemax": upperBound,
    "aria-valuemin": lowerBound,
    "aria-valuenow": currentValue,
    role: "separator",
    tabIndex: disabled ? undefined : 0,
  };

  return useRender<ResizeHandleState, HTMLElement>({
    defaultTagName: "div",
    props: {
      ...mergeProps<"div">(internalProps, props, protectedProps),
      className: typeof className === "function" ? className(state) : className,
      "data-slot": "resize-handle",
    },
    ref: ref ? [elementRef, ref] : elementRef,
    render,
    state,
    stateAttributesMapping: {
      disabled: (isDisabled) => (isDisabled ? { "data-disabled": "" } : null),
      dragging: (isDragging) => (isDragging ? { "data-dragging": "" } : null),
      orientation: (currentOrientation) => ({ "data-orientation": currentOrientation }),
      value: () => null,
    },
  });
}
