"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { Sidebar } from "../primitives/sidebar.js";
import { styles } from "./sidebar.stylex.js";

type StyledPartProps<Component extends React.ElementType> = Omit<
  React.ComponentPropsWithRef<Component>,
  "className" | "style"
> & {
  style?: stylex.StyleXStyles;
};

export type SidebarPanelProps = StyledPartProps<typeof Sidebar.Panel>;
export function SidebarPanel({ style, ...props }: SidebarPanelProps) {
  return <Sidebar.Panel {...props} {...stylex.props(styles.panel, style)} />;
}

export type SidebarHeaderProps = StyledPartProps<typeof Sidebar.Header>;
export function SidebarHeader({ style, ...props }: SidebarHeaderProps) {
  return <Sidebar.Header {...props} {...stylex.props(styles.header, style)} />;
}

export type SidebarContentProps = StyledPartProps<typeof Sidebar.Content>;
export function SidebarContent({ style, ...props }: SidebarContentProps) {
  return <Sidebar.Content {...props} {...stylex.props(styles.content, style)} />;
}

export type SidebarFooterProps = StyledPartProps<typeof Sidebar.Footer>;
export function SidebarFooter({ style, ...props }: SidebarFooterProps) {
  return <Sidebar.Footer {...props} {...stylex.props(styles.footer, style)} />;
}

export type SidebarItemProps = StyledPartProps<typeof Sidebar.Item> & {
  icon?: React.ReactNode;
};

export function SidebarItem({
  children,
  icon,
  nested = false,
  selected = false,
  style,
  ...props
}: SidebarItemProps) {
  return (
    <Sidebar.Item
      {...props}
      nested={nested}
      selected={selected}
      {...stylex.props(
        styles.item,
        nested && styles.nestedItem,
        selected && styles.selectedItem,
        style,
      )}
    >
      {icon && (
        <span aria-hidden="true" {...stylex.props(styles.icon)}>
          {icon}
        </span>
      )}
      <span {...stylex.props(styles.label)}>{children}</span>
    </Sidebar.Item>
  );
}

export const SidebarRecipe = {
  ...Sidebar,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Header: SidebarHeader,
  Item: SidebarItem,
  Panel: SidebarPanel,
} as const;
