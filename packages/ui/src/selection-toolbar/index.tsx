"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { X } from "lucide-react";

import { Button, type ButtonProps } from "../button/index.js";
import { IconButton } from "../icon-button/index.js";
import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./selection-toolbar.stylex.js";

export interface SelectionToolbarRootProps extends StyleXProps<
  React.ComponentPropsWithoutRef<"div">
> {
  count: number;
  countLabel?: React.ReactNode;
  clearLabel?: string;
  onClear: () => void;
}

export const SelectionToolbarRoot = React.forwardRef<HTMLDivElement, SelectionToolbarRootProps>(
  function SelectionToolbarRoot(
    { children, clearLabel = "Clear selection", count, countLabel, onClear, xstyle, ...props },
    ref,
  ) {
    if (count <= 0) return null;
    return (
      <div
        {...props}
        {...stylex.props(styles.root, xstyle)}
        aria-label={props["aria-label"] ?? "Selection actions"}
        data-slot="selection-toolbar"
        ref={ref}
        role="toolbar"
      >
        <span {...stylex.props(styles.count)} data-slot="selection-toolbar-count">
          {countLabel ?? `${count} selected`}
        </span>
        <div {...stylex.props(styles.actions)}>{children}</div>
        <IconButton
          aria-label={clearLabel}
          onClick={onClear}
          size="compact"
          variant="ghost"
          xstyle={styles.dismiss}
        >
          <X size={16} />
        </IconButton>
      </div>
    );
  },
);

export interface SelectionToolbarActionProps extends Omit<ButtonProps, "size" | "variant"> {
  icon?: React.ReactNode;
}

export const SelectionToolbarAction = React.forwardRef<HTMLElement, SelectionToolbarActionProps>(
  function SelectionToolbarAction({ children, icon, xstyle, ...props }, ref) {
    return (
      <Button
        {...props}
        ref={ref}
        size="compact"
        variant="secondary"
        xstyle={[styles.action, xstyle] as stylex.StyleXStyles}
      >
        {icon && (
          <span aria-hidden="true" {...stylex.props(styles.actionIcon)}>
            {icon}
          </span>
        )}
        {children}
      </Button>
    );
  },
);

export const SelectionToolbar = {
  Action: SelectionToolbarAction,
  Root: SelectionToolbarRoot,
} as const;
