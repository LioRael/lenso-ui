"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { mergeClassName } from "../shared/merge-class-name.js";
import { createStyledPart } from "../shared/styled-part.js";
import { styles } from "./settings-row.stylex.js";

export interface SettingsRowRootProps extends React.ComponentPropsWithRef<"div"> {
  disabled?: boolean;
}

export function SettingsRowRoot({
  className,
  disabled = false,
  ref,
  ...props
}: SettingsRowRootProps) {
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
}

export const SettingsRowCopy = createStyledPart("div", "settings-row-copy", styles.copy);
export const SettingsRowTitle = createStyledPart("h3", "settings-row-title", styles.title);
export const SettingsRowDescription = createStyledPart(
  "p",
  "settings-row-description",
  styles.description,
);
export const SettingsRowControl = createStyledPart("div", "settings-row-control", styles.control);

export const SettingsRow = {
  Control: SettingsRowControl,
  Copy: SettingsRowCopy,
  Description: SettingsRowDescription,
  Root: SettingsRowRoot,
  Title: SettingsRowTitle,
} as const;
