"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0.
import * as React from "react";
import { Menu as Base } from "@base-ui/react/menu";
import { menuItemStyles as s } from "@lenso/tokens/menu-item";
import { styledPart } from "../../utils/styled.js";

const Item = styledPart(Base.Item, "menu-item", s.root);
const Checkbox = styledPart(Base.CheckboxItem, "menu-item", s.root);
const Radio = styledPart(Base.RadioItem, "menu-item", s.root);
const Link = styledPart(Base.LinkItem, "menu-item", s.root);
export function MenuItemRoot({
  variant = "default",
  xstyle,
  ...props
}: React.ComponentProps<typeof Item> & { variant?: "default" | "danger" }) {
  return <Item {...props} xstyle={[variant === "danger" && s.danger, xstyle]} />;
}
export function MenuItemCheckbox({
  variant = "default",
  xstyle,
  ...props
}: React.ComponentProps<typeof Checkbox> & { variant?: "default" | "danger" }) {
  return <Checkbox {...props} xstyle={[variant === "danger" && s.danger, xstyle]} />;
}
export function MenuItemRadio({
  variant = "default",
  xstyle,
  ...props
}: React.ComponentProps<typeof Radio> & { variant?: "default" | "danger" }) {
  return <Radio {...props} xstyle={[variant === "danger" && s.danger, xstyle]} />;
}
export function MenuItemLink({
  variant = "default",
  xstyle,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: "default" | "danger" }) {
  return <Link {...props} xstyle={[variant === "danger" && s.danger, xstyle]} />;
}
export const MenuItemIndicator = styledPart(
  Base.CheckboxItemIndicator,
  "menu-item-indicator",
  s.indicator,
);
export const MenuItemRadioIndicator = styledPart(
  Base.RadioItemIndicator,
  "menu-item-indicator",
  s.indicator,
);
export const MenuItemSubmenuIndicator = styledPart(
  "span",
  "menu-item-submenu-indicator",
  s.submenuIndicator,
);
export const MenuItemLabel = styledPart("span", "label", s.label);
export const MenuItemDescription = styledPart("span", "description", s.description);
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
