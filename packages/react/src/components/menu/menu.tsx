"use client";
// HeroUI v3.2.6 menu anatomy, Apache-2.0; Base UI owns navigation.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Menu as Base } from "@base-ui/react/menu";
import { inputStyles } from "@lenso/tokens/input";
import { emptyStateStyles } from "@lenso/tokens/empty-state";
import { buttonStyles, buttonSizes, buttonVariants } from "@lenso/tokens/button";
import { menuStyles as s } from "@lenso/tokens/menu";
import { menuItemStyles } from "@lenso/tokens/menu-item";
import { modalStyles } from "@lenso/tokens/modal";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { MenuItem } from "../menu-item/index.js";
import { MenuSection } from "../menu-section/index.js";

export function MenuRoot<Payload = unknown>(props: Base.Root.Props<Payload>) {
  return <Base.Root {...props} />;
}
export function MenuTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Trigger.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Trigger>, "ref">) {
  const compiled = stylex.props(modalStyles.trigger, xstyle);
  return (
    <Base.Trigger
      {...props}
      {...compiled}
      style={mergeStyle<Base.Trigger.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-trigger"}
    />
  );
}
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
export function MenuPositioner({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Positioner.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Positioner>, "ref">) {
  const compiled = stylex.props(s.positioner, xstyle);
  return (
    <Base.Positioner
      {...props}
      {...compiled}
      style={mergeStyle<Base.Positioner.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-positioner"}
    />
  );
}
export function MenuPopup({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Popup.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Popup>, "ref">) {
  const compiled = stylex.props(s.popup, xstyle);
  return (
    <Base.Popup
      {...props}
      {...compiled}
      style={mergeStyle<Base.Popup.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-popup"}
    />
  );
}
export function MenuSeparator({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Separator.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Separator>, "ref">) {
  const compiled = stylex.props(s.separator, xstyle);
  return (
    <Base.Separator
      {...props}
      {...compiled}
      style={mergeStyle<Base.Separator.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-separator"}
    />
  );
}
export function MenuArrow({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Arrow.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Arrow>, "ref">) {
  const compiled = stylex.props(s.arrow, xstyle);
  return (
    <Base.Arrow
      {...props}
      {...compiled}
      style={mergeStyle<Base.Arrow.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-arrow"}
    />
  );
}
export function MenuBackdrop({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Backdrop.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Backdrop>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.Backdrop
      {...props}
      {...compiled}
      style={mergeStyle<Base.Backdrop.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-backdrop"}
    />
  );
}
export function MenuSubmenuTrigger({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.SubmenuTrigger.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.SubmenuTrigger>, "ref">) {
  const compiled = stylex.props(menuItemStyles.root, xstyle);
  return (
    <Base.SubmenuTrigger
      {...props}
      {...compiled}
      style={mergeStyle<Base.SubmenuTrigger.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-submenu-trigger"}
    />
  );
}
export const MenuSubmenuRoot = Base.SubmenuRoot;
export const MenuRadioGroup = Base.RadioGroup;
export const MenuFilterProvider = Base.FilterProvider;
export const useMenuFilter = Base.useFilter;
export function MenuInput({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Input.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Input>, "ref">) {
  const compiled = stylex.props(inputStyles.input, inputStyles.fullWidth, xstyle);
  return (
    <Base.Input
      {...props}
      {...compiled}
      style={mergeStyle<Base.Input.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-input"}
    />
  );
}
export function MenuList({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.List.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.List>, "ref">) {
  const compiled = stylex.props(s.list, xstyle);
  return (
    <Base.List
      {...props}
      {...compiled}
      style={mergeStyle<Base.List.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-list"}
    />
  );
}
export function MenuClear({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Clear.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Clear>, "ref">) {
  const compiled = stylex.props(buttonStyles.root, buttonSizes.sm, buttonVariants.ghost, xstyle);
  return (
    <Base.Clear
      {...props}
      {...compiled}
      style={mergeStyle<Base.Clear.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-clear"}
    />
  );
}
export function MenuEmpty({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Empty.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Empty>, "ref">) {
  const compiled = stylex.props(emptyStateStyles.root, xstyle);
  return (
    <Base.Empty
      {...props}
      {...compiled}
      style={mergeStyle<Base.Empty.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-empty"}
    />
  );
}
export function MenuViewport({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Viewport.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Viewport>, "ref">) {
  const compiled = stylex.props(xstyle);
  return (
    <Base.Viewport
      {...props}
      {...compiled}
      style={mergeStyle<Base.Viewport.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-viewport"}
    />
  );
}
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
  FilterProvider: MenuFilterProvider,
  Input: MenuInput,
  List: MenuList,
  Clear: MenuClear,
  Empty: MenuEmpty,
  useFilter: useMenuFilter,
});
