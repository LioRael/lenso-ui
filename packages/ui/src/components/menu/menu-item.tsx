"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import * as SdkMenu from "@ui-sdk/react/menu";
import { slotRender } from "../../utils/sdk-render.js";
import { menuItemStyles as s } from "@lenso/tokens/menu";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export function MenuItemRoot({
  variant = "default",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkMenu.MenuItem>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkMenu.MenuItem>, "ref"> & {
    variant?: "default" | "danger";
  }) {
  const compiled = stylex.props(s.root, variant === "danger" && s.danger, xstyle);
  return (
    <SdkMenu.MenuItem
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "menu-item", props.render)}
    />
  );
}
export function MenuItemCheckbox({
  variant = "default",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkMenu.MenuCheckboxItem>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkMenu.MenuCheckboxItem>, "ref"> & {
    variant?: "default" | "danger";
  }) {
  const compiled = stylex.props(s.root, variant === "danger" && s.danger, xstyle);
  return (
    <SdkMenu.MenuCheckboxItem
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "menu-item", props.render)}
    />
  );
}
export function MenuItemRadio({
  variant = "default",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkMenu.MenuRadioItem>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkMenu.MenuRadioItem>, "ref"> & {
    variant?: "default" | "danger";
  }) {
  const compiled = stylex.props(s.root, variant === "danger" && s.danger, xstyle);
  return (
    <SdkMenu.MenuRadioItem
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "menu-item", props.render)}
    />
  );
}
export function MenuItemIndicator({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkMenu.MenuItemIndicator>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkMenu.MenuItemIndicator>, "ref">) {
  const compiled = stylex.props(s.indicator, xstyle);
  return (
    <SdkMenu.MenuItemIndicator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("span", props["data-lenso-slot"] ?? "menu-item-indicator", props.render)}
    />
  );
}
export function MenuItemSubmenuIndicator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">>) {
  const compiled = stylex.props(s.submenuIndicator, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ??
        "menu-item-submenu-indicator"
      }
    />
  );
}
export function MenuItemLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">>) {
  const compiled = stylex.props(s.label, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={(props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "label"}
    />
  );
}
export function MenuItemDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">>) {
  const compiled = stylex.props(s.description, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={
        (props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "description"
      }
    />
  );
}
export function MenuItemIcon({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">>) {
  const compiled = stylex.props(s.icon, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="menu-item-icon"
    />
  );
}
export function MenuItemContent({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">>) {
  const compiled = stylex.props(s.content, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="menu-item-content"
    />
  );
}
export function MenuItemShortcut({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">>) {
  const compiled = stylex.props(s.shortcut, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="menu-item-shortcut"
    />
  );
}
export const MenuItem = Object.assign(MenuItemRoot, {
  Root: MenuItemRoot,
  Icon: MenuItemIcon,
  Content: MenuItemContent,
  Shortcut: MenuItemShortcut,
  Checkbox: MenuItemCheckbox,
  Radio: MenuItemRadio,
  Indicator: MenuItemIndicator,
  SubmenuIndicator: MenuItemSubmenuIndicator,
  Label: MenuItemLabel,
  Description: MenuItemDescription,
});
