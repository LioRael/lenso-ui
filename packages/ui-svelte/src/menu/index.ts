import MenuBarItem from "./menu-bar-item.svelte";
export { MenuBarItem };
import MenuBar from "./menu-bar.svelte";
export { MenuBar };
import MenuExpandTrigger from "./menu-expand-trigger.svelte";
export { MenuExpandTrigger };
import MenuActionGroup from "./menu-action-group.svelte";
export { MenuActionGroup };
import MenuAction from "./menu-action.svelte";
export { MenuAction };
import { MenuSub } from "@ui-sdk/svelte/menu";
import { MenuItems } from "@ui-sdk/svelte/menu";
import MenuTrigger from "./menu-trigger.svelte";
import MenuContent from "./menu-content.svelte";
import MenuItem from "./menu-item.svelte";
import MenuItemIcon from "./menu-item-icon.svelte";
import MenuCheckboxItem from "./menu-checkbox-item.svelte";
import MenuRadioItem from "./menu-radio-item.svelte";
import MenuRadioGroup from "./menu-radio-group.svelte";
import MenuItemIndicator from "./menu-item-indicator.svelte";
import MenuGroup from "./menu-group.svelte";
import MenuGroupLabel from "./menu-group-label.svelte";
import MenuSeparator from "./menu-separator.svelte";
import MenuSubTrigger from "./menu-sub-trigger.svelte";
import MenuSubContent from "./menu-sub-content.svelte";
import MenuShortcut from "./menu-shortcut.svelte";
import MenuRoot from "./menu-root.svelte";

export {
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuItemIcon,
  MenuCheckboxItem,
  MenuRadioItem,
  MenuRadioGroup,
  MenuItemIndicator,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
  MenuSubTrigger,
  MenuSubContent,
  MenuShortcut,
  MenuRoot,
  MenuSub,
  MenuItems,
};
import MenuItemContent from "./menu-item-content.svelte";
import MenuItemLabel from "./menu-item-label.svelte";
import MenuItemDescription from "./menu-item-description.svelte";
import MenuItemSubmenuIndicator from "./menu-item-submenu-indicator.svelte";
const ItemParts: {
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
const Item: typeof MenuItem & typeof ItemParts = Object.assign(MenuItem, ItemParts);
const Group: typeof MenuGroup & { Root: typeof MenuGroup; Label: typeof MenuGroupLabel } =
  Object.assign(MenuGroup, { Root: MenuGroup, Label: MenuGroupLabel });
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
export { useMenuSourceRef } from "./context.js";
