"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { useRender } from "@base-ui/react/use-render";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./surface.stylex.js";

export type SurfaceLevel = "embedded" | "overlay" | "panel";

export interface SurfaceProps extends StyleXProps<useRender.ComponentProps<"div">> {
  level?: SurfaceLevel;
}

export const Surface = React.forwardRef<HTMLElement, SurfaceProps>(function Surface(
  { level = "embedded", render, xstyle, ...props },
  ref,
) {
  return useRender({
    defaultTagName: "div",
    props: {
      ...props,
      className: stylex.props(styles.root, styles[level], xstyle).className,
      "data-level": level,
      "data-slot": "surface",
    },
    ref,
    render,
  });
});
