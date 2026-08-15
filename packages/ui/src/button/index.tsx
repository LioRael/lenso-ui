"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./button.stylex.js";

const loadingIndicatorPath =
  "M10 4.99962C10 5.98589 9.70832 6.95013 9.16165 7.77103C8.61498 8.59193 7.83774 9.23282 6.92772 9.61307C6.0177 9.99331 5.01555 10.0959 4.04734 9.90802C3.07914 9.72011 2.18814 9.25005 1.48644 8.55698C0.784733 7.86392 0.303671 6.97881 0.103776 6.01301C-0.0961202 5.04721 -0.00592118 4.04387 0.363025 3.1292C0.731971 2.21454 1.36318 1.42942 2.17725 0.872625C2.99131 0.315826 3.95186 0.0122187 4.93806 0L4.9554 1.39989C4.24534 1.40869 3.55374 1.62729 2.96762 2.02818C2.38149 2.42908 1.92702 2.99436 1.66138 3.65292C1.39574 4.31148 1.33079 5.03388 1.47472 5.72926C1.61864 6.42464 1.96501 7.06191 2.47024 7.56092C2.97546 8.05993 3.61698 8.39837 4.31409 8.53367C5.01119 8.66897 5.73274 8.59508 6.38796 8.3213C7.04317 8.04752 7.60278 7.58608 7.99639 6.99503C8.38999 6.40398 8.6 5.70973 8.6 4.99962H10Z";

function DefaultLoadingIndicator() {
  const maskId = `button-spinner-${React.useId().replaceAll(":", "")}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="none"
      viewBox="0 0 10 9.99962"
      {...stylex.props(styles.spinner)}
    >
      <mask fill="white" id={maskId}>
        <path d={loadingIndicatorPath} />
      </mask>
      <path
        d={loadingIndicatorPath}
        mask={`url(#${maskId})`}
        stroke="currentColor"
        strokeWidth="3"
      />
    </svg>
  );
}

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
      {loading && (loadingIndicator === undefined ? <DefaultLoadingIndicator /> : loadingIndicator)}
      {children}
      <span
        aria-hidden="true"
        data-slot="button-state-layer"
        {...stylex.props(styles.stateLayer)}
      />
    </BaseButton>
  );
});
