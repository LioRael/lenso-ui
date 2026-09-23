"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./tabs.stylex.js";

export type TabsRootProps = StyleXProps<BaseTabs.Root.Props>;
export const TabsRoot = React.forwardRef<HTMLDivElement, TabsRootProps>(function TabsRoot(
  { xstyle, ...props },
  ref,
) {
  return (
    <BaseTabs.Root
      {...props}
      className={stylex.props(styles.root, xstyle).className}
      data-slot="tabs"
      ref={ref}
    />
  );
});

export interface TabsListProps extends StyleXProps<BaseTabs.List.Props> {
  density?: "default" | "compact";
}
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { density = "default", xstyle, ...props },
  ref,
) {
  return (
    <BaseTabs.List
      {...props}
      className={
        stylex.props(styles.list, density === "compact" && styles.compactList, xstyle).className
      }
      data-density={density}
      data-slot="tabs-list"
      ref={ref}
    />
  );
});

export interface TabsTabProps extends StyleXProps<BaseTabs.Tab.Props> {
  "data-visual-state"?: "focus-visible" | "hover" | "pressed" | undefined;
  density?: "default" | "compact";
}

export const TabsTab = React.forwardRef<HTMLElement, TabsTabProps>(function TabsTab(
  { "data-visual-state": visualState, density = "default", xstyle, ...props },
  ref,
) {
  return (
    <BaseTabs.Tab
      {...props}
      className={
        stylex.props(styles.tab, density === "compact" && styles.compactTab, xstyle).className
      }
      data-density={density}
      data-slot="tabs-tab"
      data-visual-state={visualState}
      ref={ref}
    />
  );
});

export type TabsPanelProps = StyleXProps<BaseTabs.Panel.Props>;
export const TabsPanel = React.forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { xstyle, ...props },
  ref,
) {
  return (
    <BaseTabs.Panel
      {...props}
      className={stylex.props(styles.panel, xstyle).className}
      data-slot="tabs-panel"
      ref={ref}
    />
  );
});

export const Tabs = {
  List: TabsList,
  Panel: TabsPanel,
  Root: TabsRoot,
  Tab: TabsTab,
} as const;
