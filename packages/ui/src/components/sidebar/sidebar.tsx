"use client";
import type { ComponentProps } from "react";
import * as Collapsible from "@ui-sdk/react/collapsible";
import { slotRender } from "../../utils/sdk-render.js";
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
      data-lenso-slot="sidebar-root"
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
      data-lenso-slot="sidebar-header"
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
      data-lenso-slot="sidebar-content"
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
      data-lenso-slot="sidebar-footer"
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
      data-lenso-slot="sidebar-group"
    />
  );
}
export type SidebarLabelProps = StyleXProps<ComponentProps<"h3">>;
export function SidebarLabel({ children, xstyle, style, ...props }: SidebarLabelProps) {
  const compiled = stylex.props(sidebarStyles.label, xstyle);
  return (
    <h3
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="sidebar-label"
    >
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
      data-lenso-slot="sidebar-icon"
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
      data-lenso-slot="sidebar-text"
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
      data-lenso-slot="sidebar-accessory"
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
      data-lenso-slot="sidebar-item"
    />
  );
}
export type SidebarDisclosureTriggerProps = StyleXProps<
  React.ComponentProps<typeof Collapsible.CollapsibleTrigger>
>;
export function SidebarDisclosureTrigger({
  xstyle,
  style,
  ...props
}: SidebarDisclosureTriggerProps) {
  const compiled = stylex.props(sidebarStyles.item, sidebarStyles.disclosureTrigger, xstyle);
  return (
    <Collapsible.CollapsibleTrigger
      {...props}
      {...compiled}
      style={mergeStyle<Collapsible.CollapsibleTriggerState>(compiled.style, style)}
      data-lenso-slot="sidebar-disclosure-trigger"
      render={slotRender("button", "sidebar-disclosure-trigger", props.render)}
    />
  );
}
export type SidebarDisclosurePanelProps = StyleXProps<
  React.ComponentProps<typeof Collapsible.CollapsiblePanel>
>;
export function SidebarDisclosurePanel({
  children,
  xstyle,
  style,
  ...props
}: SidebarDisclosurePanelProps) {
  const compiled = stylex.props(sidebarStyles.disclosurePanel, xstyle);
  return (
    <Collapsible.CollapsiblePanel
      {...props}
      {...compiled}
      style={mergeStyle<Collapsible.CollapsiblePanelState>(compiled.style, style)}
      data-lenso-slot="sidebar-disclosure-panel"
      render={slotRender("div", "sidebar-disclosure-panel", props.render)}
    >
      {(state) => (
        <div
          {...stylex.props(sidebarStyles.disclosureBody)}
          data-lenso-slot="sidebar-disclosure-body"
        >
          {typeof children === "function" ? children(state) : children}
        </div>
      )}
    </Collapsible.CollapsiblePanel>
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
  Disclosure: Collapsible.Collapsible,
  DisclosureTrigger: SidebarDisclosureTrigger,
  DisclosurePanel: SidebarDisclosurePanel,
});
export type SidebarProps = SidebarRootProps;
