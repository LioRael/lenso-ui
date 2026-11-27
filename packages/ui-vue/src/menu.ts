import { Button as MenuNativeButton } from "@ui-sdk/vue/button";
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
} from "@ui-sdk/vue/menu";
import {
  defineComponent,
  h,
  inject,
  mergeProps,
  provide,
  shallowRef,
  type InjectionKey,
  type VNode,
} from "vue";
import { forwardPart, sdkPart, type StyledPart } from "./parts.js";

type MenuSource = {
  current: () => HTMLElement | undefined;
  attach: (node: HTMLElement) => () => void;
};
const Source: InjectionKey<MenuSource> = Symbol("MenuSource");
export function useMenuSource() {
  return inject(Source, undefined);
}
export function useMenuSourceRef() {
  return inject(Source, undefined)?.attach ?? (() => () => {});
}
export function menuTriggerHooks() {
  const attach = useMenuSourceRef();
  let previous: HTMLElement | undefined;
  let detach: (() => void) | undefined;
  function connect({ el }: VNode) {
    if (!(el instanceof HTMLElement) || el === previous) return;
    detach?.();
    previous = el;
    detach = attach(el);
  }
  return {
    onVnodeMounted: connect,
    onVnodeUpdated: connect,
    onVnodeBeforeUnmount: () => detach?.(),
  };
}

export const MenuRoot: typeof SdkRoot = defineComponent({
  name: "LensoMenu",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const source = shallowRef<HTMLElement>();
    provide(Source, {
      current: () => source.value,
      attach(node) {
        source.value = node;
        return () => {
          if (source.value === node) source.value = undefined;
        };
      },
    });
    return () => h(SdkRoot, attrs, slots);
  },
}) as unknown as typeof SdkRoot;
const Trigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "menu-trigger",
  () => menuStyles.trigger,
);
export const MenuTrigger: typeof Trigger = defineComponent({
  name: "LensoMenuTrigger",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const lifecycle = menuTriggerHooks();
    return () => h(Trigger, mergeProps(attrs, lifecycle), slots);
  },
}) as unknown as typeof Trigger;
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
  typeof SdkItem,
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
export const MenuSub: typeof SdkSub = forwardPart(SdkSub);
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
export const MenuItems: typeof SdkItems = forwardPart(SdkItems);
export const MenuShortcut: StyledPart<typeof SdkShortcut> = sdkPart(
  SdkShortcut,
  "menu-shortcut",
  () => menuItemStyles.shortcut,
);

export const MenuAction: StyledPart<typeof SdkItem> = sdkPart(SdkItem, "menu-action", () => [
  menuItemStyles.root,
  menuStyles.action,
]);
export const MenuActionGroup: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "menu-action-group",
  () => [menuSectionStyles.root, menuStyles.actionGroup],
);
export const MenuExpandTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "menu-expand-trigger",
  () => menuStyles.expand,
);

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
export const menuItemParts: {
  Root: typeof MenuItem;
  Icon: typeof MenuItemIcon;
  Content: typeof MenuItemContent;
  Shortcut: typeof MenuShortcut;
  Checkbox: typeof MenuCheckboxItem;
  Radio: typeof MenuRadioItem;
  Indicator: typeof MenuItemIndicator;
  SubmenuIndicator: typeof MenuItemSubmenuIndicator;
  Label: typeof MenuItemLabel;
  Description: typeof MenuItemDescription;
} = {
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
const Item: typeof MenuItem & typeof menuItemParts = Object.assign(MenuItem, menuItemParts);
const Group: typeof MenuGroup & {
  Root: typeof MenuGroup;
  Label: typeof MenuGroupLabel;
} = Object.assign(MenuGroup, { Root: MenuGroup, Label: MenuGroupLabel });
export const menuParts: {
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
} = {
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
};

export const Menu: typeof MenuRoot & typeof menuParts = Object.assign(MenuRoot, menuParts);

export { MenuContent as MenuSurface };
