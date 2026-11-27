import { Button as MenuNativeButton } from "@ui-sdk/solid/button";
import { htmlPart } from "./parts.js";
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
import { createContext, useContext, merge, createComponent, type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

function createMenuSource() {
  let current: HTMLElement | null = null;
  return {
    get current() {
      return current;
    },
    attach(node: HTMLElement) {
      current = node;
      return () => {
        if (current === node) current = null;
      };
    },
  };
}
export const MenuSource = createContext<ReturnType<typeof createMenuSource> | null>(null);
export function useMenuSourceRef() {
  const source = useContext(MenuSource);
  return (node: HTMLElement) => source?.attach(node);
}
export function MenuRoot(props: ComponentProps<typeof SdkRoot>) {
  return createComponent(MenuSource, {
    value: createMenuSource(),
    get children() {
      return createComponent(SdkRoot, props);
    },
  });
}
const Trigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "menu-trigger",
  () => menuStyles.trigger,
);
export function MenuTrigger(props: ComponentProps<typeof Trigger>) {
  const ref = useMenuSourceRef();
  return createComponent(
    Trigger,
    merge(props, {
      get ref() {
        return [ref, props.ref];
      },
    }),
  );
}
export const MenuContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "menu-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    materialStyles.blur,
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
    materialStyles.blur,
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

export function MenuAction(props: ComponentProps<typeof MenuItem>) {
  return createComponent(
    MenuItem,
    merge({ "data-lenso-slot": "menu-action" }, props, {
      get xstyle() {
        return [menuStyles.action, props.xstyle];
      },
    }),
  );
}
export function MenuActionGroup(props: ComponentProps<typeof MenuGroup>) {
  return createComponent(
    MenuGroup,
    merge({ "data-lenso-slot": "menu-action-group" }, props, {
      get xstyle() {
        return [menuStyles.actionGroup, props.xstyle];
      },
    }),
  );
}
export function MenuExpandTrigger(props: ComponentProps<typeof MenuTrigger>) {
  return createComponent(
    MenuTrigger,
    merge({ "aria-label": "More actions", "data-lenso-slot": "menu-expand-trigger" }, props, {
      get xstyle() {
        return [menuStyles.expand, props.xstyle];
      },
    }),
  );
}
export const MenuBar = htmlPart("div", "menu-bar", () => menuStyles.bar);
export const MenuBarItem: StyledPart<typeof MenuNativeButton> = sdkPart(
  MenuNativeButton,
  "menu-bar-item",
  () => menuStyles.barItem,
);
const MenuItemContent = htmlPart("span", "menu-item-content", () => menuItemStyles.content);
const MenuItemLabel = htmlPart("span", "menu-item-label", () => menuItemStyles.label);
const MenuItemDescription = htmlPart(
  "span",
  "menu-item-description",
  () => menuItemStyles.description,
);
const MenuItemSubmenuIndicator = htmlPart(
  "span",
  "menu-item-submenu-indicator",
  () => menuItemStyles.submenuIndicator,
);
const ItemParts = {
  Root: MenuItem,
  Icon: MenuItemIcon,
  Content: MenuItemContent,
  Shortcut: MenuShortcut,
  Checkbox: MenuCheckboxItem,
  Radio: MenuRadioItem,
  Indicator: MenuItemIndicator,
  SubmenuIndicator: MenuItemSubmenuIndicator,
  Label: MenuItemLabel,
  Description: MenuItemDescription,
};
const Item = Object.assign(MenuItem, ItemParts);
const Group = Object.assign(MenuGroup, { Root: MenuGroup, Label: MenuGroupLabel });
export const Menu: typeof MenuRoot & {
  Action: typeof MenuAction;
  ActionGroup: typeof MenuActionGroup;
  ExpandTrigger: typeof MenuExpandTrigger;
  Bar: typeof MenuBar;
  BarItem: typeof MenuBarItem;
  Root: typeof MenuRoot;
  Trigger: typeof MenuTrigger;
  Content: typeof MenuContent;
  Item: typeof Item;
  ItemIcon: typeof MenuItemIcon;
  CheckboxItem: typeof MenuCheckboxItem;
  RadioItem: typeof MenuRadioItem;
  RadioGroup: typeof MenuRadioGroup;
  ItemIndicator: typeof MenuItemIndicator;
  Group: typeof Group;
  GroupLabel: typeof MenuGroupLabel;
  Separator: typeof MenuSeparator;
  Sub: typeof MenuSub;
  SubTrigger: typeof MenuSubTrigger;
  SubContent: typeof MenuSubContent;
  Items: typeof MenuItems;
  Shortcut: typeof MenuShortcut;
} = Object.assign(MenuRoot, {
  Action: MenuAction,
  ActionGroup: MenuActionGroup,
  ExpandTrigger: MenuExpandTrigger,
  Bar: MenuBar,
  BarItem: MenuBarItem,
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item,
  ItemIcon: MenuItemIcon,
  CheckboxItem: MenuCheckboxItem,
  RadioItem: MenuRadioItem,
  RadioGroup: MenuRadioGroup,
  ItemIndicator: MenuItemIndicator,
  Group,
  GroupLabel: MenuGroupLabel,
  Separator: MenuSeparator,
  Sub: MenuSub,
  SubTrigger: MenuSubTrigger,
  SubContent: MenuSubContent,
  Items: MenuItems,
  Shortcut: MenuShortcut,
});

export { MenuContent as MenuSurface };
