"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./button.stylex.js";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "compact" | "default";

export interface ButtonProps extends Omit<BaseButton.Props, "children" | "className" | "disabled"> {
  children?: React.ReactNode;
  className?: BaseButton.Props["className"];
  disabled?: boolean;
  loading?: boolean;
  loadingIndicator?: React.ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

export const Button = React.forwardRef<HTMLElement, ButtonProps>(function Button(
  {
    children,
    className,
    disabled,
    loading = false,
    loadingIndicator,
    size = "compact",
    variant = "primary",
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

  return (
    <BaseButton
      {...props}
      aria-busy={loading || undefined}
      className={mergeClassName(generated, className)}
      data-loading={loading ? "" : undefined}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      disabled={disabled || loading}
      ref={ref}
    >
      {loading &&
        (loadingIndicator === undefined ? (
          <span aria-hidden="true" {...stylex.props(styles.spinner)} />
        ) : (
          loadingIndicator
        ))}
      {children}
    </BaseButton>
  );
});
