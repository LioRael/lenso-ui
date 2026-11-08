"use client";
import type { ComponentProps } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { sidebarStyles } from "@lenso/tokens/sidebar";
import * as stylex from "@stylexjs/stylex";
import { LinkRoot, type LinkRootProps } from "../link/link.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export type SidebarRootProps = StyleXProps<ComponentProps<"nav">>;
export function SidebarRoot({ xstyle, style, ...props }: SidebarRootProps) {
  const compiled = stylex.props(sidebarStyles.root, xstyle);
  return (
    <nav
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="sidebar-root"
    />
  );
}
export type SidebarHeaderProps = StyleXProps<ComponentProps<"div">>;
export function SidebarHeader({ xstyle, style, ...props }: SidebarHeaderProps) {
  const compiled = stylex.props(sidebarStyles.header, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="sidebar-header"
    />
  );
}
export type SidebarContentProps = StyleXProps<ComponentProps<"div">>;
export function SidebarContent({ xstyle, style, ...props }: SidebarContentProps) {
  const compiled = stylex.props(sidebarStyles.content, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="sidebar-content"
    />
  );
}
export type SidebarFooterProps = StyleXProps<ComponentProps<"div">>;
export function SidebarFooter({ xstyle, style, ...props }: SidebarFooterProps) {
  const compiled = stylex.props(sidebarStyles.footer, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="sidebar-footer"
    />
  );
}
export type SidebarGroupProps = StyleXProps<ComponentProps<"section">>;
export function SidebarGroup({ xstyle, style, ...props }: SidebarGroupProps) {
  const compiled = stylex.props(sidebarStyles.group, xstyle);
  return (
    <section
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="sidebar-group"
    />
  );
}
export type SidebarLabelProps = StyleXProps<ComponentProps<"h3">>;
export function SidebarLabel({ children, xstyle, style, ...props }: SidebarLabelProps) {
  const compiled = stylex.props(sidebarStyles.label, xstyle);
  return (
    <h3 {...props} {...compiled} style={{ ...compiled.style, ...style }} data-slot="sidebar-label">
      {children}
    </h3>
  );
}
export type SidebarIconProps = StyleXProps<ComponentProps<"span">>;
export function SidebarIcon({ xstyle, style, ...props }: SidebarIconProps) {
  const compiled = stylex.props(sidebarStyles.icon, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="sidebar-icon"
    />
  );
}
export type SidebarTextProps = StyleXProps<ComponentProps<"span">>;
export function SidebarText({ xstyle, style, ...props }: SidebarTextProps) {
  const compiled = stylex.props(sidebarStyles.text, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="sidebar-text"
    />
  );
}
export type SidebarAccessoryProps = StyleXProps<ComponentProps<"span">>;
export function SidebarAccessory({ xstyle, style, ...props }: SidebarAccessoryProps) {
  const compiled = stylex.props(sidebarStyles.accessory, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="sidebar-accessory"
    />
  );
}
export type SidebarItemProps = LinkRootProps & { selected?: boolean; indent?: 0 | 1 | 2 };
export function SidebarItem({ selected = false, indent = 0, xstyle, ...props }: SidebarItemProps) {
  return (
    <LinkRoot
      aria-current={selected ? "page" : undefined}
      {...props}
      xstyle={[
        sidebarStyles.item,
        selected && sidebarStyles.selected,
        sidebarStyles.indent(indent),
        xstyle,
      ]}
      data-slot="sidebar-item"
    />
  );
}
export type SidebarDisclosureTriggerProps = StyleXProps<Collapsible.Trigger.Props>;
export function SidebarDisclosureTrigger({
  xstyle,
  style,
  ...props
}: SidebarDisclosureTriggerProps) {
  const compiled = stylex.props(sidebarStyles.item, sidebarStyles.disclosureTrigger, xstyle);
  return (
    <Collapsible.Trigger
      {...props}
      {...compiled}
      style={mergeStyle<Collapsible.Trigger.State>(compiled.style, style)}
      data-slot="sidebar-disclosure-trigger"
    />
  );
}
export type SidebarDisclosurePanelProps = StyleXProps<Collapsible.Panel.Props>;
export function SidebarDisclosurePanel({
  children,
  xstyle,
  style,
  ...props
}: SidebarDisclosurePanelProps) {
  const compiled = stylex.props(sidebarStyles.disclosurePanel, xstyle);
  return (
    <Collapsible.Panel
      {...props}
      {...compiled}
      style={mergeStyle<Collapsible.Panel.State>(compiled.style, style)}
      data-slot="sidebar-disclosure-panel"
    >
      <div {...stylex.props(sidebarStyles.disclosureBody)} data-slot="sidebar-disclosure-body">
        {children}
      </div>
    </Collapsible.Panel>
  );
}
export const Sidebar = Object.assign(SidebarRoot, {
  Root: SidebarRoot,
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  Label: SidebarLabel,
  Item: SidebarItem,
  Icon: SidebarIcon,
  Text: SidebarText,
  Accessory: SidebarAccessory,
  Disclosure: Collapsible.Root,
  DisclosureTrigger: SidebarDisclosureTrigger,
  DisclosurePanel: SidebarDisclosurePanel,
});
export type SidebarProps = SidebarRootProps;
