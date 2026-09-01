"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { useRender } from "@base-ui/react/use-render";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./surface.stylex.js";

export type SurfaceLevel = "embedded" | "overlay" | "panel";

export interface SurfaceProps extends useRender.ComponentProps<"div"> {
  level?: SurfaceLevel;
}

export const Surface = React.forwardRef<HTMLElement, SurfaceProps>(function Surface(
  { className, level = "embedded", render, ...props },
  ref,
) {
  return useRender({
    defaultTagName: "div",
    props: {
      ...props,
      className: mergeClassName(stylex.props(styles.root, styles[level]).className, className),
      "data-level": level,
      "data-slot": "surface",
    },
    ref,
    render,
  });
});
