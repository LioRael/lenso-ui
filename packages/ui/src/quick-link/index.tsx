"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./quick-link.stylex.js";

export interface QuickLinkProps extends StyleXProps<Omit<BaseButton.Props, "children">> {
  children: React.ReactNode;
  leadingIcon: React.ReactNode;
  trailingIcon: React.ReactNode;
}

export const QuickLink = React.forwardRef<HTMLElement, QuickLinkProps>(function QuickLink(
  { children, leadingIcon, trailingIcon, xstyle, ...props },
  ref,
) {
  return (
    <BaseButton
      {...props}
      className={stylex.props(styles.root, xstyle).className}
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
