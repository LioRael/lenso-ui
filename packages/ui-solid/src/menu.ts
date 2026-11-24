import { menuStyles, menuItemStyles, menuSectionStyles } from "@lenso/tokens/menu";
import { materialStyles } from "@lenso/tokens/materials";
import {
  Menu as SdkRoot,
  MenuTrigger as SdkTrigger,
  MenuContent as SdkContent,
  MenuItem as SdkItem,
  MenuItemIcon as SdkItemIcon,
  MenuCheckboxItem as SdkCheckboxItem,
  MenuRadioItem as SdkRadioItem,
  MenuRadioGroup as SdkRadioGroup,
  MenuItemIndicator as SdkItemIndicator,
  MenuGroup as SdkGroup,
  MenuGroupLabel as SdkGroupLabel,
  MenuSeparator as SdkSeparator,
  MenuSub as SdkSub,
  MenuSubTrigger as SdkSubTrigger,
  MenuSubContent as SdkSubContent,
  MenuItems as SdkItems,
  MenuShortcut as SdkShortcut,
} from "@ui-sdk/solid/menu";
import { createComponent, type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

export const MenuRoot = (props: ComponentProps<typeof SdkRoot>) => createComponent(SdkRoot, props);
export const MenuTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "menu-trigger",
  () => menuStyles.trigger,
);
export const MenuContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "menu-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    materialStyles.anchored,
    menuStyles.positioner,
    menuStyles.popup,
    menuStyles.content,
  ],
);
export const MenuItem: StyledPart<typeof SdkItem, { variant?: "default" | "danger" }> = sdkPart<
  ComponentProps<typeof SdkItem>,
  { variant?: "default" | "danger" }
>(
  SdkItem,
  "menu-item",
  (props) => [menuItemStyles.root, props.variant === "danger" && menuItemStyles.danger],
  "variant",
);
export const MenuItemIcon: StyledPart<typeof SdkItemIcon> = sdkPart(
  SdkItemIcon,
  "menu-item-icon",
  () => menuItemStyles.icon,
);
export const MenuCheckboxItem: StyledPart<typeof SdkCheckboxItem> = sdkPart(
  SdkCheckboxItem,
  "menu-checkbox-item",
  () => menuItemStyles.root,
);
export const MenuRadioItem: StyledPart<typeof SdkRadioItem> = sdkPart(
  SdkRadioItem,
  "menu-radio-item",
  () => menuItemStyles.root,
);
export const MenuRadioGroup: StyledPart<typeof SdkRadioGroup> = sdkPart(
  SdkRadioGroup,
  "menu-radio-group",
  () => undefined,
);
export const MenuItemIndicator: StyledPart<typeof SdkItemIndicator> = sdkPart(
  SdkItemIndicator,
  "menu-item-indicator",
  () => [menuItemStyles.indicator, menuItemStyles.menuIndicator],
);
export const MenuGroup: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "menu-group",
  () => menuSectionStyles.root,
);
export const MenuGroupLabel: StyledPart<typeof SdkGroupLabel> = sdkPart(
  SdkGroupLabel,
  "menu-group-label",
  () => [menuSectionStyles.label, menuSectionStyles.menuLabel],
);
export const MenuSeparator: StyledPart<typeof SdkSeparator> = sdkPart(
  SdkSeparator,
  "menu-separator",
  () => menuStyles.separator,
);
export const MenuSub = (props: ComponentProps<typeof SdkSub>) => createComponent(SdkSub, props);
export const MenuSubTrigger: StyledPart<typeof SdkSubTrigger> = sdkPart(
  SdkSubTrigger,
  "menu-sub-trigger",
  () => menuItemStyles.root,
);
export const MenuSubContent: StyledPart<typeof SdkSubContent> = sdkPart(
  SdkSubContent,
  "menu-sub-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    materialStyles.anchored,
    menuStyles.positioner,
    menuStyles.popup,
    menuStyles.content,
  ],
);
export const MenuItems = (props: ComponentProps<typeof SdkItems>) =>
  createComponent(SdkItems, props);
export const MenuShortcut: StyledPart<typeof SdkShortcut> = sdkPart(
  SdkShortcut,
  "menu-shortcut",
  () => menuItemStyles.shortcut,
);

export const Menu: typeof MenuRoot & {
  Root: typeof MenuRoot;
  Trigger: typeof MenuTrigger;
  Content: typeof MenuContent;
  Item: typeof MenuItem;
  ItemIcon: typeof MenuItemIcon;
  CheckboxItem: typeof MenuCheckboxItem;
  RadioItem: typeof MenuRadioItem;
  RadioGroup: typeof MenuRadioGroup;
  ItemIndicator: typeof MenuItemIndicator;
  Group: typeof MenuGroup;
  GroupLabel: typeof MenuGroupLabel;
  Separator: typeof MenuSeparator;
  Sub: typeof MenuSub;
  SubTrigger: typeof MenuSubTrigger;
  SubContent: typeof MenuSubContent;
  Items: typeof MenuItems;
  Shortcut: typeof MenuShortcut;
} = Object.assign(MenuRoot, {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  ItemIcon: MenuItemIcon,
  CheckboxItem: MenuCheckboxItem,
  RadioItem: MenuRadioItem,
  RadioGroup: MenuRadioGroup,
  ItemIndicator: MenuItemIndicator,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  Separator: MenuSeparator,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
  Items: MenuItems,
  Shortcut: MenuShortcut,
});
