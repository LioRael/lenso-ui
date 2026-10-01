"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Menu as Base } from "@base-ui/react/menu";
import { menuItemStyles as s } from "@lenso/tokens/menu-item";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export function MenuItemRoot({
  variant = "default",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Item.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Item>, "ref"> & { variant?: "default" | "danger" }) {
  const compiled = stylex.props(s.root, variant === "danger" && s.danger, xstyle);
  return (
    <Base.Item
      {...props}
      {...compiled}
      style={mergeStyle<Base.Item.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-item"}
    />
  );
}
export function MenuItemCheckbox({
  variant = "default",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.CheckboxItem.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.CheckboxItem>, "ref"> & {
    variant?: "default" | "danger";
  }) {
  const compiled = stylex.props(s.root, variant === "danger" && s.danger, xstyle);
  return (
    <Base.CheckboxItem
      {...props}
      {...compiled}
      style={mergeStyle<Base.CheckboxItem.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-item"}
    />
  );
}
export function MenuItemRadio({
  variant = "default",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.RadioItem.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.RadioItem>, "ref"> & {
    variant?: "default" | "danger";
  }) {
  const compiled = stylex.props(s.root, variant === "danger" && s.danger, xstyle);
  return (
    <Base.RadioItem
      {...props}
      {...compiled}
      style={mergeStyle<Base.RadioItem.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-item"}
    />
  );
}
export function MenuItemLink({
  variant = "default",
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.LinkItem.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.LinkItem>, "ref"> & {
    variant?: "default" | "danger";
  }) {
  const compiled = stylex.props(s.root, variant === "danger" && s.danger, xstyle);
  return (
    <Base.LinkItem
      {...props}
      {...compiled}
      style={mergeStyle<Base.LinkItem.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-item"}
    />
  );
}
export function MenuItemIndicator({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.CheckboxItemIndicator.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.CheckboxItemIndicator>, "ref">) {
  const compiled = stylex.props(s.indicator, xstyle);
  return (
    <Base.CheckboxItemIndicator
      {...props}
      {...compiled}
      style={mergeStyle<Base.CheckboxItemIndicator.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-item-indicator"}
    />
  );
}
export function MenuItemRadioIndicator({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.RadioItemIndicator.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.RadioItemIndicator>, "ref">) {
  const compiled = stylex.props(s.indicator, xstyle);
  return (
    <Base.RadioItemIndicator
      {...props}
      {...compiled}
      style={mergeStyle<Base.RadioItemIndicator.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-item-indicator"}
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-item-submenu-indicator"}
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "label"}
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "description"}
    />
  );
}
export const MenuItem = Object.assign(MenuItemRoot, {
  Root: MenuItemRoot,
  Checkbox: MenuItemCheckbox,
  Radio: MenuItemRadio,
  Link: MenuItemLink,
  Indicator: MenuItemIndicator,
  RadioIndicator: MenuItemRadioIndicator,
  SubmenuIndicator: MenuItemSubmenuIndicator,
  Label: MenuItemLabel,
  Description: MenuItemDescription,
});
