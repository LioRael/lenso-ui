"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./shimmer-text.stylex.js";

export interface ShimmerTextProps extends React.ComponentPropsWithoutRef<"span"> {
  active?: boolean;
}

export const ShimmerText = React.forwardRef<HTMLSpanElement, ShimmerTextProps>(function ShimmerText(
  { active = false, className, ...props },
  ref,
) {
  return (
    <span
      {...props}
      className={
        mergeClassName(
          stylex.props(styles.root, active && styles.active).className,
          className,
        ) as string
      }
      data-active={active ? "" : undefined}
      data-slot="shimmer-text"
      ref={ref}
    />
  );
});
