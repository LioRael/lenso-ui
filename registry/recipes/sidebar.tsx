"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { Sidebar } from "../primitives/sidebar.js";
import { styles } from "./sidebar.stylex.js";

function classes(generated: string | undefined, className?: string): string {
  return [generated, className].filter(Boolean).join(" ");
}

export const SidebarPanel = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof Sidebar.Panel>
>(function SidebarPanel({ className, ...props }, ref) {
  return (
    <Sidebar.Panel
      {...props}
      className={classes(stylex.props(styles.panel).className, className)}
      ref={ref}
    />
  );
});

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Sidebar.Header>
>(function SidebarHeader({ className, ...props }, ref) {
  return (
    <Sidebar.Header
      {...props}
      className={classes(stylex.props(styles.header).className, className)}
      ref={ref}
    />
  );
});

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Sidebar.Content>
>(function SidebarContent({ className, ...props }, ref) {
  return (
    <Sidebar.Content
      {...props}
      className={classes(stylex.props(styles.content).className, className)}
      ref={ref}
    />
  );
});

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Sidebar.Footer>
>(function SidebarFooter({ className, ...props }, ref) {
  return (
    <Sidebar.Footer
      {...props}
      className={classes(stylex.props(styles.footer).className, className)}
      ref={ref}
    />
  );
});

export interface SidebarItemProps extends React.ComponentPropsWithoutRef<"button"> {
  icon?: React.ReactNode;
  nested?: boolean;
  selected?: boolean;
}

export const SidebarItem = React.forwardRef<HTMLButtonElement, SidebarItemProps>(
  function SidebarItem(
    { children, className, icon, nested = false, selected = false, type = "button", ...props },
    ref,
  ) {
    return (
      <button
        {...props}
        aria-current={selected ? "page" : undefined}
        className={classes(
          stylex.props(styles.item, nested && styles.nestedItem, selected && styles.selectedItem)
            .className,
          className,
        )}
        data-level={nested ? "nested" : "root"}
        data-slot="sidebar-item"
        data-state={selected ? "selected" : "default"}
        ref={ref}
        type={type}
      >
        {icon && (
          <span aria-hidden="true" {...stylex.props(styles.icon)}>
            {icon}
          </span>
        )}
        <span {...stylex.props(styles.label)}>{children}</span>
      </button>
    );
  },
);

export const SidebarRecipe = {
  ...Sidebar,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Header: SidebarHeader,
  Item: SidebarItem,
  Panel: SidebarPanel,
} as const;
