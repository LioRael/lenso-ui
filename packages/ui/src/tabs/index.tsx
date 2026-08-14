"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";

import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./tabs.stylex.js";

export const TabsRoot = React.forwardRef<HTMLDivElement, BaseTabs.Root.Props>(function TabsRoot(
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.Root
      {...props}
      className={mergeClassName(stylex.props(styles.root).className, className)}
      data-slot="tabs"
      ref={ref}
    />
  );
});

export const TabsList = React.forwardRef<HTMLDivElement, BaseTabs.List.Props>(function TabsList(
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.List
      {...props}
      className={mergeClassName(stylex.props(styles.list).className, className)}
      data-slot="tabs-list"
      ref={ref}
    />
  );
});

export interface TabsTabProps extends BaseTabs.Tab.Props {
  "data-visual-state"?: "focus-visible" | "hover" | "pressed" | undefined;
}

export const TabsTab = React.forwardRef<HTMLElement, TabsTabProps>(function TabsTab(
  { className, "data-visual-state": visualState, ...props },
  ref,
) {
  return (
    <BaseTabs.Tab
      {...props}
      className={mergeClassName(stylex.props(styles.tab).className, className)}
      data-slot="tabs-tab"
      data-visual-state={visualState}
      ref={ref}
    />
  );
});

export const TabsPanel = React.forwardRef<HTMLDivElement, BaseTabs.Panel.Props>(function TabsPanel(
  { className, ...props },
  ref,
) {
  return (
    <BaseTabs.Panel
      {...props}
      className={mergeClassName(stylex.props(styles.panel).className, className)}
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
