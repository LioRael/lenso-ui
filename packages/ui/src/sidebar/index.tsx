"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";
import { Sidebar as SidebarPrimitive } from "@lenso/primitives/sidebar";

import { Disclosure, type DisclosurePanelProps } from "../disclosure/index.js";
import { createStyledPart } from "../shared/styled-part.js";
import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./sidebar.stylex.js";

export type SidebarGroupProps = StyleXProps<React.ComponentProps<typeof SidebarPrimitive.Group>>;
export function SidebarGroup({ xstyle, ...props }: SidebarGroupProps) {
  return <SidebarPrimitive.Group {...props} className={stylex.props(xstyle).className} />;
}

export type SidebarRootProps = StyleXProps<React.ComponentProps<typeof SidebarPrimitive.Root>>;
export function SidebarRoot({ xstyle, ...props }: SidebarRootProps) {
  return <SidebarPrimitive.Root {...props} className={stylex.props(xstyle).className} />;
}

export const SidebarPanel = createStyledPart(SidebarPrimitive.Panel, "sidebar-panel", styles.panel);
export const SidebarHeader = createStyledPart(
  SidebarPrimitive.Header,
  "sidebar-header",
  styles.header,
);
export const SidebarContent = createStyledPart(
  SidebarPrimitive.Content,
  "sidebar-content",
  styles.content,
);
export const SidebarFooter = createStyledPart(
  SidebarPrimitive.Footer,
  "sidebar-footer",
  styles.footer,
);
export const SidebarMenu = createStyledPart(SidebarPrimitive.Menu, "sidebar-menu", styles.menu);
export const SidebarMenuItem = createStyledPart(
  SidebarPrimitive.MenuItem,
  "sidebar-menu-item",
  styles.menuItem,
);
export const SidebarSubmenu = createStyledPart(
  SidebarPrimitive.Submenu,
  "sidebar-submenu",
  styles.submenu,
);

export interface SidebarWorkspaceProps extends StyleXProps<Omit<BaseButton.Props, "children">> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  indicator?: React.ReactNode;
}

export function SidebarWorkspace({
  children,
  icon,
  indicator,
  ref,
  xstyle,
  ...props
}: SidebarWorkspaceProps) {
  return (
    <BaseButton
      {...props}
      className={stylex.props(styles.workspace, xstyle).className}
      data-slot="sidebar-workspace"
      ref={ref}
    >
      {icon && (
        <span aria-hidden="true" {...stylex.props(styles.workspaceMark)}>
          {icon}
        </span>
      )}
      <span {...stylex.props(styles.workspaceLabel)}>{children}</span>
      {indicator && (
        <span aria-hidden="true" {...stylex.props(styles.workspaceChevron)}>
          {indicator}
        </span>
      )}
    </BaseButton>
  );
}

export const SidebarHeaderSpacer = createStyledPart(
  "div",
  "sidebar-header-spacer",
  styles.headerSpacer,
);

export interface SidebarItemProps extends StyleXProps<Omit<BaseButton.Props, "children">> {
  badge?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
  nested?: boolean;
  selected?: boolean;
}

export function SidebarItem({
  badge,
  children,
  icon,
  nested = false,
  ref,
  selected = false,
  xstyle,
  ...props
}: SidebarItemProps) {
  return (
    <BaseButton
      {...props}
      aria-current={selected ? "page" : undefined}
      className={
        stylex.props(
          styles.item,
          nested && styles.nestedItem,
          selected && styles.selectedItem,
          xstyle,
        ).className
      }
      data-level={nested ? "nested" : "root"}
      data-slot="sidebar-item"
      data-state={selected ? "selected" : "default"}
      ref={ref}
    >
      {icon && (
        <span aria-hidden="true" {...stylex.props(styles.icon, nested && styles.nestedIcon)}>
          {icon}
        </span>
      )}
      <span {...stylex.props(styles.label)}>{children}</span>
      {badge !== undefined && <span {...stylex.props(styles.badge)}>{badge}</span>}
    </BaseButton>
  );
}

export const SidebarSection = createStyledPart("section", "sidebar-section", styles.section);
export const SidebarSectionHeader = createStyledPart(
  "div",
  "sidebar-section-header",
  styles.sectionHeader,
);
export const SidebarSectionLabel = createStyledPart(
  "span",
  "sidebar-section-label",
  styles.sectionLabel,
);
export function SidebarSectionTrigger({
  xstyle,
  ...props
}: React.ComponentProps<typeof Disclosure.Trigger>) {
  return <Disclosure.Trigger {...props} xstyle={[styles.sectionTrigger, xstyle]} />;
}
export const SidebarSectionAction = createStyledPart(
  "div",
  "sidebar-section-action",
  styles.sectionAction,
);

export function SidebarSectionContent({
  children,
  layout = "auto",
  ref,
  ...props
}: DisclosurePanelProps) {
  return (
    <Disclosure.Panel {...props} layout={layout} ref={ref}>
      <div data-slot="sidebar-section-content" {...stylex.props(styles.sectionContent)}>
        {children}
      </div>
    </Disclosure.Panel>
  );
}

export const Sidebar = {
  ...SidebarPrimitive,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  Header: SidebarHeader,
  HeaderSpacer: SidebarHeaderSpacer,
  Item: SidebarItem,
  Menu: SidebarMenu,
  MenuItem: SidebarMenuItem,
  Panel: SidebarPanel,
  Root: SidebarRoot,
  Section: SidebarSection,
  SectionAction: SidebarSectionAction,
  SectionContent: SidebarSectionContent,
  SectionHeader: SidebarSectionHeader,
  SectionLabel: SidebarSectionLabel,
  SectionTrigger: SidebarSectionTrigger,
  Submenu: SidebarSubmenu,
  Workspace: SidebarWorkspace,
} as const;
