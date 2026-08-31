"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { useRender } from "@base-ui/react/use-render";

import { mergeClassName } from "../shared/merge-class-name.js";
import { createStyledPart } from "../shared/styled-part.js";
import { styles } from "./content-state.stylex.js";

export type ContentStateAlign = "center" | "start";

export interface ContentStateRootProps extends useRender.ComponentProps<"div"> {
  align?: ContentStateAlign;
}

export const ContentStateRoot = React.forwardRef<HTMLElement, ContentStateRootProps>(
  function ContentStateRoot({ align = "center", className, render, ...props }, ref) {
    return useRender({
      defaultTagName: "div",
      props: {
        ...props,
        className: mergeClassName(
          stylex.props(styles.root, align === "start" && styles.start).className,
          className,
        ),
        "data-align": align,
        "data-slot": "content-state",
      },
      ref,
      render,
    });
  },
);

export const ContentStateVisual = createStyledPart("div", "content-state-visual", styles.visual);

export type ContentStateTitleElement = "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface ContentStateTitleProps extends React.ComponentPropsWithoutRef<"div"> {
  as?: ContentStateTitleElement;
}

export const ContentStateTitle = React.forwardRef<HTMLElement, ContentStateTitleProps>(
  function ContentStateTitle({ as = "div", className, ...props }, ref) {
    const Component: React.ElementType = as;
    return React.createElement(Component, {
      ...props,
      className: mergeClassName(stylex.props(styles.title).className, className),
      "data-slot": "content-state-title",
      ref,
    });
  },
);

export const ContentStateDescription = createStyledPart(
  "p",
  "content-state-description",
  styles.description,
);
export const ContentStateActions = createStyledPart("div", "content-state-actions", styles.actions);

export const ContentState = {
  Actions: ContentStateActions,
  Description: ContentStateDescription,
  Root: ContentStateRoot,
  Title: ContentStateTitle,
  Visual: ContentStateVisual,
} as const;
