"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import {
  ResizeHandle as ResizeHandlePrimitive,
  type ResizeHandleProps as ResizeHandlePrimitiveProps,
} from "@lenso/primitives/resize-handle";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./resize-handle.stylex.js";

export type ResizeHandleVisualState = "dragging" | "focus-visible" | "hover";

export interface ResizeHandleProps extends Omit<
  StyleXProps<ResizeHandlePrimitiveProps>,
  "children"
> {
  "data-visual-state"?: ResizeHandleVisualState;
}

/**
 * A quiet, edge-aligned splitter handle inspired by Linear's panel dividers.
 * The seven-pixel hit target stays stable while the half-pixel indicator fades in.
 */
export const ResizeHandle = React.forwardRef<HTMLElement, ResizeHandleProps>(function ResizeHandle(
  { "data-visual-state": visualState, orientation = "vertical", xstyle, ...props },
  ref,
) {
  return (
    <ResizeHandlePrimitive
      {...props}
      data-visual-state={visualState}
      orientation={orientation}
      ref={ref}
      xstyle={
        [
          styles.root,
          orientation === "vertical" ? styles.verticalRoot : styles.horizontalRoot,
          visualState === "hover" && styles.hover,
          visualState === "focus-visible" && styles.focusVisible,
          visualState === "dragging" && styles.dragging,
          xstyle,
        ] as unknown as stylex.StyleXStyles
      }
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
