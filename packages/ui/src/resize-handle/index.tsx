"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import {
  ResizeHandle as ResizeHandlePrimitive,
  type ResizeHandleProps as ResizeHandlePrimitiveProps,
  type ResizeHandleState,
} from "@lenso/primitives/resize-handle";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./resize-handle.stylex.js";

export type ResizeHandleVisualState = "dragging" | "focus-visible" | "hover";

export interface ResizeHandleProps extends Omit<ResizeHandlePrimitiveProps, "children"> {
  "data-visual-state"?: ResizeHandleVisualState;
}

/**
 * A quiet, edge-aligned splitter handle inspired by Linear's panel dividers.
 * The seven-pixel hit target stays stable while the half-pixel indicator fades in.
 */
export const ResizeHandle = React.forwardRef<HTMLElement, ResizeHandleProps>(function ResizeHandle(
  { className, "data-visual-state": visualState, orientation = "vertical", ...props },
  ref,
) {
  const generatedClassName = stylex.props(
    styles.root,
    orientation === "vertical" ? styles.verticalRoot : styles.horizontalRoot,
    visualState === "hover" && styles.hover,
    visualState === "focus-visible" && styles.focusVisible,
    visualState === "dragging" && styles.dragging,
  ).className;

  return (
    <ResizeHandlePrimitive
      {...props}
      className={mergeClassName<ResizeHandleState>(generatedClassName, className)}
      data-visual-state={visualState}
      orientation={orientation}
      ref={ref}
    >
      <span
        aria-hidden="true"
        data-slot="resize-handle-indicator"
        {...stylex.props(
          styles.indicator,
          orientation === "vertical" ? styles.verticalIndicator : styles.horizontalIndicator,
        )}
      />
    </ResizeHandlePrimitive>
  );
});

export type {
  ResizeHandleChangeDetails,
  ResizeHandleChangeReason,
  ResizeHandleInputEvent,
  ResizeHandleOrientation,
  ResizeHandleState,
} from "@lenso/primitives/resize-handle";
