"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./settings-row.stylex.js";

export interface SettingsRowRootProps extends React.ComponentPropsWithoutRef<"div"> {
  disabled?: boolean;
}

export const SettingsRowRoot = React.forwardRef<HTMLDivElement, SettingsRowRootProps>(
  function SettingsRowRoot({ className, disabled = false, ...props }, ref) {
    return (
      <div
        {...props}
        aria-disabled={disabled || undefined}
        className={mergeClassName(stylex.props(styles.root).className, className) as string}
        data-disabled={disabled ? "true" : undefined}
        data-slot="settings-row"
        ref={ref}
      />
    );
  },
);

function styledPart<T extends HTMLElement>(
  Component: React.ElementType,
  slot: string,
  style: unknown,
) {
  return React.forwardRef<T, React.HTMLAttributes<T>>(function SettingsRowPart(
    { className, ...props },
    ref,
  ) {
    return (
      <Component
        {...props}
        className={mergeClassName(stylex.props(style as never).className, className) as string}
        data-slot={slot}
        ref={ref}
      />
    );
  });
}

export const SettingsRowCopy = styledPart<HTMLDivElement>("div", "settings-row-copy", styles.copy);
export const SettingsRowTitle = styledPart<HTMLHeadingElement>(
  "h3",
  "settings-row-title",
  styles.title,
);
export const SettingsRowDescription = styledPart<HTMLParagraphElement>(
  "p",
  "settings-row-description",
  styles.description,
);
export const SettingsRowControl = styledPart<HTMLDivElement>(
  "div",
  "settings-row-control",
  styles.control,
);

export const SettingsRow = {
  Control: SettingsRowControl,
  Copy: SettingsRowCopy,
  Description: SettingsRowDescription,
  Root: SettingsRowRoot,
  Title: SettingsRowTitle,
} as const;
