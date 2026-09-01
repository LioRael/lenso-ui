"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./page-header.stylex.js";

export type PageHeaderVariant = "issues" | "simple" | "team";

interface PageHeaderContextValue {
  variant: PageHeaderVariant;
}
const PageHeaderContext = React.createContext<PageHeaderContextValue>({ variant: "team" });

export interface PageHeaderRootProps extends StyleXProps<React.ComponentPropsWithoutRef<"header">> {
  variant?: PageHeaderVariant;
}

export const PageHeaderRoot = React.forwardRef<HTMLElement, PageHeaderRootProps>(
  function PageHeaderRoot({ variant = "team", xstyle, ...props }, ref) {
    const value = React.useMemo(() => ({ variant }), [variant]);
    return (
      <PageHeaderContext.Provider value={value}>
        <header
          {...props}
          {...stylex.props(styles.root, styles[variant], xstyle)}
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
  StyleXProps<React.ComponentPropsWithoutRef<"div">>
>(function PageHeaderRow({ xstyle, ...props }, ref) {
  const { variant } = React.useContext(PageHeaderContext);
  return (
    <div
      {...props}
      {...stylex.props(
        styles.row,
        variant === "simple" && styles.simpleRow,
        variant === "team" && styles.teamRow,
        variant === "issues" && styles.issuesRow,
        xstyle,
      )}
      data-slot="page-header-row"
      ref={ref}
    />
  );
});

export const PageHeaderLeading = React.forwardRef<
  HTMLSpanElement,
  StyleXProps<React.ComponentPropsWithoutRef<"span">>
>(function PageHeaderLeading({ xstyle, ...props }, ref) {
  return (
    <span
      {...props}
      aria-hidden="true"
      {...stylex.props(styles.leading, xstyle)}
      data-slot="page-header-leading"
      ref={ref}
    />
  );
});

export const PageHeaderTitle = React.forwardRef<
  HTMLHeadingElement,
  StyleXProps<React.ComponentPropsWithoutRef<"h1">>
>(function PageHeaderTitle({ children, xstyle, ...props }, ref) {
  const { variant } = React.useContext(PageHeaderContext);
  return (
    <h1
      {...props}
      {...stylex.props(
        styles.title,
        variant === "simple" ? styles.simpleTitle : styles.teamTitle,
        xstyle,
      )}
      data-slot="page-header-title"
      ref={ref}
    >
      {children}
    </h1>
  );
});

export const PageHeaderActions = React.forwardRef<
  HTMLDivElement,
  StyleXProps<React.ComponentPropsWithoutRef<"div">>
>(function PageHeaderActions({ xstyle, ...props }, ref) {
  return (
    <div
      {...props}
      {...stylex.props(styles.actions, xstyle)}
      data-slot="page-header-actions"
      ref={ref}
    />
  );
});

export const PageHeaderSpacer = React.forwardRef<
  HTMLDivElement,
  StyleXProps<React.ComponentPropsWithoutRef<"div">>
>(function PageHeaderSpacer({ xstyle, ...props }, ref) {
  return (
    <div
      {...props}
      {...stylex.props(styles.spacer, xstyle)}
      data-slot="page-header-spacer"
      ref={ref}
    />
  );
});

export const PageHeaderTabsRoot = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseTabs.Root.Props>
>(function PageHeaderTabsRoot({ xstyle, ...props }, ref) {
  return (
    <BaseTabs.Root
      {...props}
      className={stylex.props(styles.tabsRoot, xstyle).className}
      data-slot="page-header-tabs"
      ref={ref}
    />
  );
});

export const PageHeaderTabsRow = React.forwardRef<
  HTMLDivElement,
  StyleXProps<React.ComponentPropsWithoutRef<"div">>
>(function PageHeaderTabsRow({ xstyle, ...props }, ref) {
  return (
    <div
      {...props}
      {...stylex.props(styles.tabsRow, xstyle)}
      data-slot="page-header-tabs-row"
      ref={ref}
    />
  );
});

export const PageHeaderTabsList = React.forwardRef<
  HTMLDivElement,
  StyleXProps<BaseTabs.List.Props>
>(function PageHeaderTabsList({ xstyle, ...props }, ref) {
  return (
    <BaseTabs.List
      {...props}
      className={stylex.props(styles.tabsList, xstyle).className}
      data-slot="page-header-tabs-list"
      ref={ref}
    />
  );
});

export const PageHeaderTab = React.forwardRef<HTMLElement, StyleXProps<BaseTabs.Tab.Props>>(
  function PageHeaderTab({ xstyle, ...props }, ref) {
    return (
      <BaseTabs.Tab
        {...props}
        className={stylex.props(styles.tab, xstyle).className}
        data-slot="page-header-tab"
        ref={ref}
      />
    );
  },
);

export const PageHeaderPanel = React.forwardRef<HTMLDivElement, StyleXProps<BaseTabs.Panel.Props>>(
  function PageHeaderPanel({ xstyle, ...props }, ref) {
    return (
      <BaseTabs.Panel
        {...props}
        className={stylex.props(styles.panel, xstyle).className}
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
