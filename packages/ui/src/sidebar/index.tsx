"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Button as BaseButton } from "@base-ui/react/button";
import { Sidebar as SidebarPrimitive } from "@lenso/primitives/sidebar";

import { Disclosure, type DisclosurePanelProps } from "../disclosure/index.js";
import { mergeClassName } from "../shared/merge-class-name.js";
import { styles } from "./sidebar.stylex.js";

function styledPart<T extends HTMLElement>(
  Component: React.ElementType,
  slot: string,
  style: unknown,
) {
  return React.forwardRef<T, React.ComponentPropsWithoutRef<typeof Component>>(function StyledPart(
    { className, ...props },
    ref,
  ) {
    return (
      <Component
        {...props}
        className={mergeClassName(stylex.props(style as never).className, className)}
        data-slot={slot}
        ref={ref}
      />
    );
  });
}

export const SidebarPanel = styledPart<HTMLElement>(
  SidebarPrimitive.Panel,
  "sidebar-panel",
  styles.panel,
);
export const SidebarHeader = styledPart<HTMLDivElement>(
  SidebarPrimitive.Header,
  "sidebar-header",
  styles.header,
);
export const SidebarContent = styledPart<HTMLDivElement>(
  SidebarPrimitive.Content,
  "sidebar-content",
  styles.content,
);
export const SidebarFooter = styledPart<HTMLDivElement>(
  SidebarPrimitive.Footer,
  "sidebar-footer",
  styles.footer,
);
export const SidebarMenu = styledPart<HTMLUListElement>(
  SidebarPrimitive.Menu,
  "sidebar-menu",
  styles.menu,
);
export const SidebarMenuItem = styledPart<HTMLLIElement>(
  SidebarPrimitive.MenuItem,
  "sidebar-menu-item",
  styles.menuItem,
);
export const SidebarSubmenu = styledPart<HTMLUListElement>(
  SidebarPrimitive.Submenu,
  "sidebar-submenu",
  styles.submenu,
);

export interface SidebarWorkspaceProps extends Omit<BaseButton.Props, "children" | "className"> {
  children: React.ReactNode;
  className?: BaseButton.Props["className"];
  icon?: React.ReactNode;
  indicator?: React.ReactNode;
}

export const SidebarWorkspace = React.forwardRef<HTMLElement, SidebarWorkspaceProps>(
  function SidebarWorkspace({ children, className, icon, indicator, ...props }, ref) {
    return (
      <BaseButton
        {...props}
        className={mergeClassName(stylex.props(styles.workspace).className, className)}
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
  },
);

export const SidebarHeaderSpacer = styledPart<HTMLDivElement>(
  "div",
  "sidebar-header-spacer",
  styles.headerSpacer,
);

export interface SidebarItemProps extends Omit<BaseButton.Props, "children" | "className"> {
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: BaseButton.Props["className"];
  icon?: React.ReactNode;
  nested?: boolean;
  selected?: boolean;
}

export const SidebarItem = React.forwardRef<HTMLElement, SidebarItemProps>(function SidebarItem(
  { badge, children, className, icon, nested = false, selected = false, ...props },
  ref,
) {
  const generated = stylex.props(
    styles.item,
    nested && styles.nestedItem,
    selected && styles.selectedItem,
  ).className;
  return (
    <BaseButton
      {...props}
      aria-current={selected ? "page" : undefined}
      className={mergeClassName(generated, className)}
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
});

export const SidebarSection = styledPart<HTMLDivElement>(
  "section",
  "sidebar-section",
  styles.section,
);
export const SidebarSectionHeader = styledPart<HTMLDivElement>(
  "div",
  "sidebar-section-header",
  styles.sectionHeader,
);
export const SidebarSectionLabel = styledPart<HTMLSpanElement>(
  "span",
  "sidebar-section-label",
  styles.sectionLabel,
);
export const SidebarSectionAction = styledPart<HTMLDivElement>(
  "div",
  "sidebar-section-action",
  styles.sectionAction,
);

export const SidebarSectionContent = React.forwardRef<HTMLDivElement, DisclosurePanelProps>(
  function SidebarSectionContent({ children, layout = "auto", ...props }, ref) {
    return (
      <Disclosure.Panel {...props} layout={layout} ref={ref}>
        <div data-slot="sidebar-section-content" {...stylex.props(styles.sectionContent)}>
          {children}
        </div>
      </Disclosure.Panel>
    );
  },
);

export const Sidebar = {
  ...SidebarPrimitive,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Header: SidebarHeader,
  HeaderSpacer: SidebarHeaderSpacer,
  Item: SidebarItem,
  Menu: SidebarMenu,
  MenuItem: SidebarMenuItem,
  Panel: SidebarPanel,
  Section: SidebarSection,
  SectionAction: SidebarSectionAction,
  SectionContent: SidebarSectionContent,
  SectionHeader: SidebarSectionHeader,
  SectionLabel: SidebarSectionLabel,
  Submenu: SidebarSubmenu,
  Workspace: SidebarWorkspace,
} as const;
