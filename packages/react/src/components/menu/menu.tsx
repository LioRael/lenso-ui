"use client";
// HeroUI v3.2.6 menu anatomy, Apache-2.0; Base UI owns navigation.
import * as React from "react";
import { Menu as Base } from "@base-ui/react/menu";
import { menuStyles as s } from "@lenso/tokens/menu";
import { menuItemStyles } from "@lenso/tokens/menu-item";
import { styledPart } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { MenuItem } from "../menu-item/index.js";
import { MenuSection } from "../menu-section/index.js";

export function MenuRoot<Payload = unknown>(props: Base.Root.Props<Payload>) {
  return <Base.Root {...props} />;
}
export const MenuTrigger = styledPart(Base.Trigger, "menu-trigger");
export function MenuPortal({
  container,
  ...props
}: React.ComponentPropsWithRef<typeof Base.Portal>) {
  const themed = useThemePortalContainer();
  return (
    <Base.Portal
      {...props}
      container={container === undefined ? (themed ?? undefined) : container}
    />
  );
}
export const MenuPositioner = styledPart(Base.Positioner, "menu-positioner", s.positioner);
export const MenuPopup = styledPart(Base.Popup, "menu-popup", s.popup);
export const MenuSeparator = styledPart(Base.Separator, "menu-separator", s.separator);
export const MenuArrow = styledPart(Base.Arrow, "menu-arrow", s.arrow);
export const MenuBackdrop = styledPart(Base.Backdrop, "menu-backdrop");
export const MenuSubmenuTrigger = styledPart(
  Base.SubmenuTrigger,
  "menu-submenu-trigger",
  menuItemStyles.root,
);
export const MenuSubmenuRoot = Base.SubmenuRoot;
export const MenuRadioGroup = Base.RadioGroup;
export const MenuViewport = styledPart(Base.Viewport, "menu-viewport");
export const Menu = Object.assign(MenuRoot, {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Portal: MenuPortal,
  Positioner: MenuPositioner,
  Popup: MenuPopup,
  Item: MenuItem,
  CheckboxItem: MenuItem.Checkbox,
  CheckboxItemIndicator: MenuItem.Indicator,
  RadioItem: MenuItem.Radio,
  RadioItemIndicator: MenuItem.RadioIndicator,
  LinkItem: MenuItem.Link,
  Section: MenuSection,
  Group: MenuSection,
  GroupLabel: MenuSection.Label,
  RadioGroup: MenuRadioGroup,
  Separator: MenuSeparator,
  Arrow: MenuArrow,
  Backdrop: MenuBackdrop,
  SubmenuRoot: MenuSubmenuRoot,
  SubmenuTrigger: MenuSubmenuTrigger,
  Viewport: MenuViewport,
});
