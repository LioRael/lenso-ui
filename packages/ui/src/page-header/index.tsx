"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./page-header.stylex.js";

export type PageHeaderVariant = "issues" | "simple" | "team";

interface PageHeaderContextValue {
  variant: PageHeaderVariant;
}
const PageHeaderContext = React.createContext<PageHeaderContextValue>({ variant: "team" });

export interface PageHeaderRootProps extends React.ComponentPropsWithoutRef<"header"> {
  variant?: PageHeaderVariant;
}

export const PageHeaderRoot = React.forwardRef<HTMLElement, PageHeaderRootProps>(
  function PageHeaderRoot({ className, variant = "team", ...props }, ref) {
    const value = React.useMemo(() => ({ variant }), [variant]);
    return (
      <PageHeaderContext.Provider value={value}>
        <header
          {...props}
          className={
            mergeClassName(
              stylex.props(styles.root, styles[variant]).className,
              className,
            ) as string
          }
          data-slot="page-header"
          data-variant={variant}
          ref={ref}
        />
      </PageHeaderContext.Provider>
    );
  },
);

export const PageHeaderRow = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function PageHeaderRow({ className, ...props }, ref) {
  const { variant } = React.useContext(PageHeaderContext);
  return (
    <div
      {...props}
      className={
        mergeClassName(
          stylex.props(
            styles.row,
            variant === "simple" && styles.simpleRow,
            variant === "team" && styles.teamRow,
            variant === "issues" && styles.issuesRow,
          ).className,
          className,
        ) as string
      }
      data-slot="page-header-row"
      ref={ref}
    />
  );
});

export const PageHeaderLeading = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(function PageHeaderLeading({ className, ...props }, ref) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={mergeClassName(stylex.props(styles.leading).className, className) as string}
      data-slot="page-header-leading"
      ref={ref}
    />
  );
});

export const PageHeaderTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<"h1">
>(function PageHeaderTitle({ children, className, ...props }, ref) {
  const { variant } = React.useContext(PageHeaderContext);
  return (
    <h1
      {...props}
      className={
        mergeClassName(
          stylex.props(styles.title, variant === "simple" ? styles.simpleTitle : styles.teamTitle)
            .className,
          className,
        ) as string
      }
      data-slot="page-header-title"
      ref={ref}
    >
      {children}
    </h1>
  );
});

export const PageHeaderActions = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function PageHeaderActions({ className, ...props }, ref) {
  return (
    <div
      {...props}
      className={mergeClassName(stylex.props(styles.actions).className, className) as string}
      data-slot="page-header-actions"
      ref={ref}
    />
  );
});

export const PageHeaderSpacer = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function PageHeaderSpacer({ className, ...props }, ref) {
  return (
    <div
      {...props}
      className={mergeClassName(stylex.props(styles.spacer).className, className) as string}
      data-slot="page-header-spacer"
      ref={ref}
    />
  );
});

export const PageHeaderTabsRoot = React.forwardRef<HTMLDivElement, BaseTabs.Root.Props>(
  function PageHeaderTabsRoot({ className, ...props }, ref) {
    return (
      <BaseTabs.Root
        {...props}
        className={mergeClassName(stylex.props(styles.tabsRoot).className, className)}
        data-slot="page-header-tabs"
        ref={ref}
      />
    );
  },
);

export const PageHeaderTabsRow = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function PageHeaderTabsRow({ className, ...props }, ref) {
  return (
    <div
      {...props}
      className={mergeClassName(stylex.props(styles.tabsRow).className, className) as string}
      data-slot="page-header-tabs-row"
      ref={ref}
    />
  );
});

export const PageHeaderTabsList = React.forwardRef<HTMLDivElement, BaseTabs.List.Props>(
  function PageHeaderTabsList({ className, ...props }, ref) {
    return (
      <BaseTabs.List
        {...props}
        className={mergeClassName(stylex.props(styles.tabsList).className, className)}
        data-slot="page-header-tabs-list"
        ref={ref}
      />
    );
  },
);

export const PageHeaderTab = React.forwardRef<HTMLElement, BaseTabs.Tab.Props>(
  function PageHeaderTab({ className, ...props }, ref) {
    return (
      <BaseTabs.Tab
        {...props}
        className={mergeClassName(stylex.props(styles.tab).className, className)}
        data-slot="page-header-tab"
        ref={ref}
      />
    );
  },
);

export const PageHeaderPanel = React.forwardRef<HTMLDivElement, BaseTabs.Panel.Props>(
  function PageHeaderPanel({ className, ...props }, ref) {
    return (
      <BaseTabs.Panel
        {...props}
        className={mergeClassName(stylex.props(styles.panel).className, className)}
        data-slot="page-header-panel"
        ref={ref}
      />
    );
  },
);

export const PageHeader = {
  Actions: PageHeaderActions,
  Leading: PageHeaderLeading,
  Panel: PageHeaderPanel,
  Root: PageHeaderRoot,
  Row: PageHeaderRow,
  Spacer: PageHeaderSpacer,
  Tab: PageHeaderTab,
  TabsList: PageHeaderTabsList,
  TabsRoot: PageHeaderTabsRoot,
  TabsRow: PageHeaderTabsRow,
  Title: PageHeaderTitle,
} as const;
