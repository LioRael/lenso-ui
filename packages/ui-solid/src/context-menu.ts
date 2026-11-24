import { contextMenuStyles } from "@lenso/tokens/context-menu";
import { menuStyles, menuItemStyles } from "@lenso/tokens/menu";
import { materialStyles } from "@lenso/tokens/materials";
import {
  Menu as SdkRoot,
  MenuContextTrigger as SdkTrigger,
  MenuContent as SdkContent,
  MenuItem as SdkItem,
  MenuSeparator as SdkSeparator,
} from "@ui-sdk/solid/menu";
import { createComponent, type ComponentProps } from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

export const ContextMenuRoot = (props: ComponentProps<typeof SdkRoot>) =>
  createComponent(SdkRoot, props);
export const ContextMenuTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "context-menu-trigger",
  () => contextMenuStyles.trigger,
);
export const ContextMenuContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "context-menu-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    materialStyles.anchored,
    menuStyles.content,
    contextMenuStyles.popup,
  ],
);
export const ContextMenuItem: StyledPart<typeof SdkItem> = sdkPart(
  SdkItem,
  "context-menu-item",
  () => menuItemStyles.root,
);
export const ContextMenuSeparator: StyledPart<typeof SdkSeparator> = sdkPart(
  SdkSeparator,
  "context-menu-separator",
  () => menuStyles.separator,
);

export const ContextMenu: typeof ContextMenuRoot & {
  Root: typeof ContextMenuRoot;
  Trigger: typeof ContextMenuTrigger;
  Content: typeof ContextMenuContent;
  Item: typeof ContextMenuItem;
  Separator: typeof ContextMenuSeparator;
} = Object.assign(ContextMenuRoot, {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Separator: ContextMenuSeparator,
});
