"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./status-marker.stylex.js";

export type StatusMarkerStatus = "error" | "info" | "neutral" | "success" | "warning";
export type StatusMarkerPresentation = "dot" | "label";

export interface StatusMarkerProps extends React.HTMLAttributes<HTMLSpanElement> {
  presentation?: StatusMarkerPresentation;
  status?: StatusMarkerStatus;
}

const labels: Record<StatusMarkerStatus, string> = {
  error: "Error",
  info: "Info",
  neutral: "Neutral",
  success: "Success",
  warning: "Warning",
};

export const StatusMarker = React.forwardRef<HTMLSpanElement, StatusMarkerProps>(
  function StatusMarker(
    { children, className, presentation = "dot", status = "neutral", ...props },
    ref,
  ) {
    const isLabel = presentation === "label";
    return (
      <span
        {...props}
        aria-hidden={!isLabel && props["aria-label"] == null ? true : undefined}
        className={
          mergeClassName(
            stylex.props(styles.root, isLabel && styles.label).className,
            className,
          ) as string
        }
        data-presentation={presentation}
        data-slot="status-marker"
        data-status={status}
        ref={ref}
      >
        <span
          aria-hidden="true"
          data-slot="status-marker-dot"
          {...stylex.props(styles.dot, styles[status])}
        />
        {isLabel && (
          <span data-slot="status-marker-label" {...stylex.props(styles.text)}>
            {children ?? labels[status]}
          </span>
        )}
      </span>
    );
  },
);
