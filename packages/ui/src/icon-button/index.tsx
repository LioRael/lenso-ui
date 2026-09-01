"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./icon-button.stylex.js";

export type IconButtonSize = "compact" | "default";
export type IconButtonVariant = "secondary" | "ghost";

export interface IconButtonProps extends Omit<
  BaseButton.Props,
  "aria-label" | "aria-pressed" | "children" | "className" | "disabled"
> {
  "aria-label": string;
  children: React.ReactElement<{
    "aria-hidden"?: boolean;
    focusable?: string;
    style?: React.CSSProperties;
  }>;
  className?: BaseButton.Props["className"];
  disabled?: boolean;
  selected?: boolean;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
}

export const IconButton = React.forwardRef<HTMLElement, IconButtonProps>(function IconButton(
  {
    "aria-label": ariaLabel,
    children,
    className,
    disabled,
    nativeButton,
    render,
    selected,
    size = "compact",
    variant = "secondary",
    ...props
  },
  ref,
) {
  const generated = stylex.props(
    styles.root,
    styles.rounded,
    styles[size],
    styles[variant],
  ).className;
  const icon = React.cloneElement(children, {
    "aria-hidden": true,
    focusable: "false",
    style: { ...children.props.style, height: "100%", width: "100%" },
  });

  return (
    <BaseButton
      {...props}
      aria-label={ariaLabel}
      aria-pressed={selected === undefined ? undefined : selected}
      className={mergeClassName(generated, className)}
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
