"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./quick-link.stylex.js";

export interface QuickLinkProps extends Omit<BaseButton.Props, "children" | "className"> {
  children: React.ReactNode;
  className?: BaseButton.Props["className"];
  leadingIcon: React.ReactNode;
  trailingIcon: React.ReactNode;
}

export const QuickLink = React.forwardRef<HTMLElement, QuickLinkProps>(function QuickLink(
  { children, className, leadingIcon, trailingIcon, ...props },
  ref,
) {
  return (
    <BaseButton
      {...props}
      className={mergeClassName(stylex.props(styles.root).className, className)}
      data-slot="quick-link"
      ref={ref}
    >
      <span aria-hidden="true" data-slot="quick-link-leading" {...stylex.props(styles.leading)}>
        {leadingIcon}
      </span>
      <span data-slot="quick-link-label" {...stylex.props(styles.label)}>
        {children}
      </span>
      <span aria-hidden="true" data-slot="quick-link-trailing" {...stylex.props(styles.trailing)}>
        {trailingIcon}
      </span>
    </BaseButton>
  );
});
