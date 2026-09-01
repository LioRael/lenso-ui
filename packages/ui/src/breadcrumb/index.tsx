"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./breadcrumb.stylex.js";

export const BreadcrumbRoot = React.forwardRef<
  HTMLElement,
  StyleXProps<React.ComponentPropsWithoutRef<"nav">>
>(function BreadcrumbRoot({ "aria-label": ariaLabel = "Breadcrumb", xstyle, ...props }, ref) {
  return (
    <nav
      {...props}
      aria-label={ariaLabel}
      {...stylex.props(styles.root, xstyle)}
      data-slot="breadcrumb-root"
      ref={ref}
    />
  );
});

export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  StyleXProps<React.ComponentPropsWithoutRef<"ol">>
>(function BreadcrumbList({ xstyle, ...props }, ref) {
  return (
    <ol {...props} {...stylex.props(styles.list, xstyle)} data-slot="breadcrumb-list" ref={ref} />
  );
});

export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  StyleXProps<React.ComponentPropsWithoutRef<"li">>
>(function BreadcrumbItem({ xstyle, ...props }, ref) {
  return (
    <li {...props} {...stylex.props(styles.item, xstyle)} data-slot="breadcrumb-item" ref={ref} />
  );
});

export type BreadcrumbLinkProps = StyleXProps<BaseButton.Props>;

export const BreadcrumbLink = React.forwardRef<HTMLElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ xstyle, ...props }, ref) {
    return (
      <BaseButton
        {...props}
        className={stylex.props(styles.interactive, xstyle).className}
        data-slot="breadcrumb-link"
        ref={ref}
      />
    );
  },
);

export const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  StyleXProps<React.ComponentPropsWithoutRef<"span">>
>(function BreadcrumbPage({ xstyle, ...props }, ref) {
  return (
    <span
      {...props}
      aria-current="page"
      {...stylex.props(styles.page, xstyle)}
      data-slot="breadcrumb-page"
      ref={ref}
    />
  );
});

export interface BreadcrumbSeparatorProps extends StyleXProps<
  React.ComponentPropsWithoutRef<"li">
> {
  children?: React.ReactNode;
}

export const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  function BreadcrumbSeparator({ children, xstyle, ...props }, ref) {
    return (
      <li
        {...props}
        aria-hidden="true"
        {...stylex.props(styles.separator, xstyle)}
        data-slot="breadcrumb-separator"
        ref={ref}
        role="presentation"
      >
        {children ?? (
          <svg aria-hidden="true" viewBox="0 0 5 7" {...stylex.props(styles.separatorIcon)}>
            <path
              d="M0.5 0.5 3.5 3.5 0.5 6.5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
            />
          </svg>
        )}
      </li>
    );
  },
);

export interface BreadcrumbEllipsisProps extends Omit<StyleXProps<BaseButton.Props>, "children"> {
  children?: React.ReactNode;
}

export const BreadcrumbEllipsis = React.forwardRef<HTMLElement, BreadcrumbEllipsisProps>(
  function BreadcrumbEllipsis(
    { "aria-label": ariaLabel = "Show more breadcrumbs", children = "…", xstyle, ...props },
    ref,
  ) {
    return (
      <BaseButton
        {...props}
        aria-label={ariaLabel}
        className={stylex.props(styles.interactive, styles.ellipsis, xstyle).className}
        data-slot="breadcrumb-ellipsis"
        ref={ref}
      >
        {children}
      </BaseButton>
    );
  },
);

export const BreadcrumbIcon = React.forwardRef<
  HTMLSpanElement,
  StyleXProps<React.ComponentPropsWithoutRef<"span">>
>(function BreadcrumbIcon({ xstyle, ...props }, ref) {
  return (
    <span
      {...props}
      aria-hidden="true"
      {...stylex.props(styles.icon, xstyle)}
      data-slot="breadcrumb-icon"
      ref={ref}
    />
  );
});

export const Breadcrumb = {
  Ellipsis: BreadcrumbEllipsis,
  Icon: BreadcrumbIcon,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  List: BreadcrumbList,
  Page: BreadcrumbPage,
  Root: BreadcrumbRoot,
  Separator: BreadcrumbSeparator,
} as const;
