"use client";
// HeroUI v3.2.6 dropdown anatomy, Apache-2.0.
import * as React from "react";
import { Menu as Base } from "@base-ui/react/menu";
import { dropdownStyles as s } from "@lenso/tokens/dropdown";
import { modalStyles } from "@lenso/tokens/modal";
import { styledPart } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";
import { Menu } from "../menu/index.js";

export function DropdownRoot<Payload = unknown>(props: Base.Root.Props<Payload>) {
  return <Base.Root {...props} />;
}
export const DropdownTrigger = styledPart(Base.Trigger, "dropdown-trigger", modalStyles.trigger);
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
export const DropdownPositioner = styledPart(Base.Positioner, "dropdown-positioner", s.positioner);
export const DropdownPopup = styledPart(Base.Popup, "dropdown-popup", s.popup);
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
