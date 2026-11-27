import { attributes, htmlPart } from "./parts.js";
import { MenuRoot, MenuSource, useMenuSourceRef, Menu } from "./menu.js";
import { contextMenuStyles } from "@lenso/tokens/context-menu";
import { menuStyles, menuItemStyles } from "@lenso/tokens/menu";
import { materialStyles } from "@lenso/tokens/materials";
import {
  MenuContextTrigger as SdkTrigger,
  MenuContent as SdkContent,
  MenuItem as SdkItem,
  MenuSeparator as SdkSeparator,
} from "@ui-sdk/solid/menu";
import {
  createContext,
  createEffect,
  createSignal,
  useContext,
  omit,
  type ComponentProps,
} from "solid-js";
import { sdkPart, type StyledPart } from "./parts.js";

import type { JSX } from "@solidjs/web";
import { presentContextPreview } from "@lenso/glass/motion";
import { IconChevronRight } from "./icons.jsx";
const Compact = createContext<{ active: () => boolean; expand: () => void } | null>(null);
export function ContextMenuRoot(props: ComponentProps<typeof MenuRoot> & { compact?: boolean }) {
  const [expanded, setExpanded] = createSignal(false);
  return (
    <Compact
      value={{ active: () => !!props.compact && !expanded(), expand: () => setExpanded(true) }}
    >
      <MenuRoot
        {...omit(props, "compact", "onOpenChange")}
        onOpenChange={(open, details) => {
          props.onOpenChange?.(open, details);
          if (open && !details.canceled) setExpanded(false);
        }}
      />
    </Compact>
  );
}
const Trigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "context-menu-trigger",
  () => contextMenuStyles.trigger,
);
export function ContextMenuTrigger(props: ComponentProps<typeof Trigger>) {
  const ref = useMenuSourceRef();
  return <Trigger tabindex={0} {...props} ref={[ref, props.ref]} />;
}
const Host: StyledPart<typeof SdkContent> = sdkPart(SdkContent, "context-menu-content", () => [
  contextMenuStyles.host,
]);
export function ContextMenuContent(
  props: ComponentProps<typeof Host> & {
    preview?: JSX.Element;
    bar?: JSX.Element;
    dim?: boolean;
    layout?: "vertical" | "horizontal";
    previewAlign?: "leading" | "trailing";
  },
) {
  const compact = useContext(Compact);
  return (
    <Host
      align="start"
      {...omit(props, "preview", "bar", "layout", "dim", "previewAlign", "children", "xstyle")}
      xstyle={[
        props.dim !== false && contextMenuStyles.dimmed,
        props.previewAlign === "trailing" && contextMenuStyles.trailing,
        props.layout === "horizontal" &&
          (props.previewAlign === "trailing"
            ? contextMenuStyles.horizontalTrailing
            : contextMenuStyles.horizontal),
        props.xstyle,
      ]}
    >
      {(state) => (
        <>
          {props.preview}
          <div
            data-lenso-slot="menu-popup"
            data-open={state.open ? "" : undefined}
            {...attributes(
              materialStyles.root,
              materialStyles.accessible,
              materialStyles.blur,
              menuStyles.content,
              contextMenuStyles.panel,
              contextMenuStyles.popup,
              compact?.active() && "bar" in props && contextMenuStyles.compactPopup,
            )}
          >
            {compact?.active() && "bar" in props ? (
              <div {...attributes(contextMenuStyles.bar)}>
                {props.bar}
                <Menu.Item
                  closeOnSelect={false}
                  aria-label="More actions"
                  onSelect={() => compact.expand()}
                >
                  <IconChevronRight />
                </Menu.Item>
              </div>
            ) : typeof props.children === "function" ? (
              props.children(state)
            ) : (
              props.children
            )}
          </div>
        </>
      )}
    </Host>
  );
}
export const ContextMenuBarItem: StyledPart<typeof SdkItem> = sdkPart(
  SdkItem,
  "context-menu-bar-item",
  () => [menuStyles.barItem, contextMenuStyles.barItem],
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

const ContextMenuPreviewBase = htmlPart(
  "div",
  "context-menu-preview",
  () => contextMenuStyles.preview,
);
export function ContextMenuPreview(props: Parameters<typeof ContextMenuPreviewBase>[0]) {
  const source = useContext(MenuSource);
  const [preview, setPreview] = createSignal<HTMLDivElement>();
  createEffect(preview, (node) => {
    const panel = node?.parentElement?.querySelector<HTMLElement>('[data-lenso-slot="menu-popup"]');
    if (node && panel && source?.current)
      return presentContextPreview(node, source.current, panel, () => {});
  });
  return (
    <ContextMenuPreviewBase aria-hidden="true" inert {...props} ref={[setPreview, props.ref]}>
      {props.children ?? null}
    </ContextMenuPreviewBase>
  );
}
const Item = Object.assign(ContextMenuItem, Menu.Item, { Root: ContextMenuItem });
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
