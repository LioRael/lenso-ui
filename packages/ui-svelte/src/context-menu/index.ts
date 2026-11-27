import ContextMenuBarItem from "./context-menu-bar-item.svelte";
import ContextMenuPreview from "./context-menu-preview.svelte";
export { ContextMenuPreview };
import { Menu } from "../menu/index.js";
import ContextMenuTrigger from "./context-menu-trigger.svelte";
import ContextMenuContent from "./context-menu-content.svelte";
import ContextMenuItem from "./context-menu-item.svelte";
import ContextMenuSeparator from "./context-menu-separator.svelte";
import ContextMenuRoot from "./context-menu-root.svelte";

export {
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuRoot,
};
const Item: typeof ContextMenuItem &
  Omit<typeof Menu.Item, "Root"> & { Root: typeof ContextMenuItem } = Object.assign(
  ContextMenuItem,
  Menu.Item,
  { Root: ContextMenuItem },
);
export const ContextMenu: typeof ContextMenuRoot &
  Omit<typeof Menu, "Root" | "Trigger" | "Content" | "Item" | "Separator" | "BarItem"> & {
    BarItem: typeof ContextMenuBarItem;
    Section: typeof Menu.Group;
    Preview: typeof ContextMenuPreview;
    Root: typeof ContextMenuRoot;
    Trigger: typeof ContextMenuTrigger;
    Content: typeof ContextMenuContent;
    Item: typeof Item;
    Separator: typeof ContextMenuSeparator;
  } = Object.assign(ContextMenuRoot, {
  ...Menu,
  BarItem: ContextMenuBarItem,
  Section: Menu.Group,
  Preview: ContextMenuPreview,
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item,
  Separator: ContextMenuSeparator,
});

export { ContextMenuBarItem };
