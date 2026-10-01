"use client";
// HeroUI v3.2.6 dropdown anatomy, Apache-2.0.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Menu as Base } from "@base-ui/react/menu";
import { dropdownStyles as s } from "@lenso/tokens/dropdown";
import { modalStyles } from "@lenso/tokens/modal";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { Menu } from "../menu/index.js";

export function DropdownRoot<Payload = unknown>(props: Base.Root.Props<Payload>) {
  return <Base.Root {...props} />;
}
export function DropdownTrigger({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "dropdown-trigger"}
    />
  );
}
export function DropdownPortal({
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
export function DropdownPositioner({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "dropdown-positioner"}
    />
  );
}
export function DropdownPopup({
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
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "dropdown-popup"}
    />
  );
}
export const Dropdown = Object.assign(DropdownRoot, {
  Root: DropdownRoot,
  Trigger: DropdownTrigger,
  Portal: DropdownPortal,
  Positioner: DropdownPositioner,
  Popup: DropdownPopup,
  Item: Menu.Item,
  Section: Menu.Section,
  CheckboxItem: Menu.CheckboxItem,
  CheckboxItemIndicator: Menu.CheckboxItemIndicator,
  RadioGroup: Menu.RadioGroup,
  RadioItem: Menu.RadioItem,
  RadioItemIndicator: Menu.RadioItemIndicator,
  LinkItem: Menu.LinkItem,
  Separator: Menu.Separator,
  SubmenuRoot: Menu.SubmenuRoot,
  SubmenuTrigger: Menu.SubmenuTrigger,
  Arrow: Menu.Arrow,
  Backdrop: Menu.Backdrop,
});
