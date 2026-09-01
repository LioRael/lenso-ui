"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./shimmer-text.stylex.js";

export interface ShimmerTextProps extends StyleXProps<React.ComponentPropsWithoutRef<"span">> {
  active?: boolean;
}

export const ShimmerText = React.forwardRef<HTMLSpanElement, ShimmerTextProps>(function ShimmerText(
  { active = false, xstyle, ...props },
  ref,
) {
  return (
    <span
      {...props}
      className={stylex.props(styles.root, active && styles.active, xstyle).className}
      data-active={active ? "" : undefined}
      data-slot="shimmer-text"
      ref={ref}
    />
  );
});
