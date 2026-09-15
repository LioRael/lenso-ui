"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { useRender } from "@base-ui/react/use-render";

import { createStyledPart } from "../shared/styled-part.js";
import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./content-state.stylex.js";

export type ContentStateAlign = "center" | "start";

export interface ContentStateRootProps extends StyleXProps<useRender.ComponentProps<"div">> {
  align?: ContentStateAlign;
}

export const ContentStateRoot = React.forwardRef<HTMLElement, ContentStateRootProps>(
  function ContentStateRoot({ align = "center", render, xstyle, ...props }, ref) {
    return useRender({
      defaultTagName: "div",
      props: {
        ...props,
        className: stylex.props(styles.root, align === "start" && styles.start, xstyle).className,
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

export interface ContentStateTitleProps extends StyleXProps<React.ComponentPropsWithoutRef<"div">> {
  as?: ContentStateTitleElement;
}

export const ContentStateTitle = React.forwardRef<HTMLElement, ContentStateTitleProps>(
  function ContentStateTitle({ as = "div", xstyle, ...props }, ref) {
    const Component: React.ElementType = as;
    return React.createElement(Component, {
      ...props,
      className: stylex.props(styles.title, xstyle).className,
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
