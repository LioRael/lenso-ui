"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./icon-button.stylex.js";

export type IconButtonSize = "compact" | "default";
export type IconButtonVariant = "secondary" | "ghost";

export interface IconButtonProps extends StyleXProps<
  Omit<BaseButton.Props, "aria-label" | "aria-pressed" | "children" | "disabled">
> {
  "aria-label": string;
  children: React.ReactElement<{
    "aria-hidden"?: boolean;
    className?: string;
    focusable?: string;
  }>;
  disabled?: boolean;
  selected?: boolean;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
}

export const IconButton = React.forwardRef<HTMLElement, IconButtonProps>(function IconButton(
  {
    "aria-label": ariaLabel,
    children,
    disabled,
    nativeButton,
    render,
    selected,
    size = "compact",
    variant = "secondary",
    xstyle,
    ...props
  },
  ref,
) {
  const icon = React.cloneElement(children, {
    "aria-hidden": true,
    ...stylex.props(styles.iconGlyph),
    focusable: "false",
  });

  return (
    <BaseButton
      {...props}
      aria-label={ariaLabel}
      aria-pressed={selected === undefined ? undefined : selected}
      className={
        stylex.props(styles.root, styles.rounded, styles[size], styles[variant], xstyle).className
      }
      data-selected={selected ? "true" : undefined}
      data-size={size}
      data-slot="icon-button"
      data-variant={variant}
      disabled={disabled}
      nativeButton={nativeButton ?? render === undefined}
      ref={ref}
      render={render}
    >
      <span aria-hidden="true" data-slot="icon-button-icon" {...stylex.props(styles.icon)}>
        {icon}
      </span>
      <span
        aria-hidden="true"
        data-slot="icon-button-state-layer"
        {...stylex.props(styles.stateLayer)}
      />
    </BaseButton>
  );
});
