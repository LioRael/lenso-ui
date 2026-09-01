"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./label.stylex.js";

export type LabelColor = "blue" | "red" | "violet";

export interface LabelProps extends Omit<StyleXProps<BaseButton.Props>, "children"> {
  children: React.ReactNode;
  color?: LabelColor;
  marker?: React.ReactNode | false;
  open?: boolean;
}

export const Label = React.forwardRef<HTMLElement, LabelProps>(function Label(
  { children, color = "red", marker, nativeButton, open = false, render, xstyle, ...props },
  ref,
) {
  return (
    <BaseButton
      {...props}
      aria-expanded={props["aria-expanded"] ?? (open ? true : undefined)}
      className={stylex.props(styles.root, open && styles.open, xstyle).className}
      data-color={color}
      data-open={open ? "true" : undefined}
      data-slot="label"
      nativeButton={nativeButton ?? render === undefined}
      ref={ref}
      render={render}
    >
      {marker !== false && (
        <span
          aria-hidden="true"
          data-slot="label-marker"
          {...stylex.props(styles.marker, marker === undefined && styles[color])}
        >
          {marker}
        </span>
      )}
      <span data-slot="label-text">{children}</span>
    </BaseButton>
  );
});
