"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./breadcrumb.stylex.js";

export const BreadcrumbRoot = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"nav">>(
  function BreadcrumbRoot({ "aria-label": ariaLabel = "Breadcrumb", className, ...props }, ref) {
    return (
      <nav
        {...props}
        aria-label={ariaLabel}
        className={[stylex.props(styles.root).className, className].filter(Boolean).join(" ")}
        data-slot="breadcrumb-root"
        ref={ref}
      />
    );
  },
);

export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(function BreadcrumbList({ className, ...props }, ref) {
  return (
    <ol
      {...props}
      className={[stylex.props(styles.list).className, className].filter(Boolean).join(" ")}
      data-slot="breadcrumb-list"
      ref={ref}
    />
  );
});

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<"li">>(
  function BreadcrumbItem({ className, ...props }, ref) {
    return (
      <li
        {...props}
        className={[stylex.props(styles.item).className, className].filter(Boolean).join(" ")}
        data-slot="breadcrumb-item"
        ref={ref}
      />
    );
  },
);

export type BreadcrumbLinkProps = BaseButton.Props;

export const BreadcrumbLink = React.forwardRef<HTMLElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ className, ...props }, ref) {
    return (
      <BaseButton
        {...props}
        className={mergeClassName(stylex.props(styles.interactive).className, className)}
        data-slot="breadcrumb-link"
        ref={ref}
      />
    );
  },
);

export const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(function BreadcrumbPage({ className, ...props }, ref) {
  return (
    <span
      {...props}
      aria-current="page"
      className={[stylex.props(styles.page).className, className].filter(Boolean).join(" ")}
      data-slot="breadcrumb-page"
      ref={ref}
    />
  );
});

export interface BreadcrumbSeparatorProps extends React.ComponentPropsWithoutRef<"li"> {
  children?: React.ReactNode;
}

export const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  function BreadcrumbSeparator({ children, className, ...props }, ref) {
    return (
      <li
        {...props}
        aria-hidden="true"
        className={[stylex.props(styles.separator).className, className].filter(Boolean).join(" ")}
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

export interface BreadcrumbEllipsisProps extends Omit<BaseButton.Props, "children"> {
  children?: React.ReactNode;
}

export const BreadcrumbEllipsis = React.forwardRef<HTMLElement, BreadcrumbEllipsisProps>(
  function BreadcrumbEllipsis(
    { "aria-label": ariaLabel = "Show more breadcrumbs", children = "…", className, ...props },
    ref,
  ) {
    return (
      <BaseButton
        {...props}
        aria-label={ariaLabel}
        className={mergeClassName(
          stylex.props(styles.interactive, styles.ellipsis).className,
          className,
        )}
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
  React.ComponentPropsWithoutRef<"span">
>(function BreadcrumbIcon({ className, ...props }, ref) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={[stylex.props(styles.icon).className, className].filter(Boolean).join(" ")}
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
