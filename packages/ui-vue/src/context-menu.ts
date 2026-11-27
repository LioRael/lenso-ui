import { presentContextPreview } from "@lenso/glass/motion";
import { contextMenuStyles as s } from "@lenso/tokens/context-menu";
import { materialStyles } from "@lenso/tokens/materials";
import { menuItemStyles, menuStyles } from "@lenso/tokens/menu";
import * as stylex from "@stylexjs/stylex";
import {
  MenuContent as SdkContent,
  MenuContextTrigger as SdkTrigger,
  MenuItem as SdkItem,
  MenuSeparator as SdkSeparator,
  type MenuContentState,
} from "@ui-sdk/vue/menu";
import {
  defineComponent,
  h,
  inject,
  mergeProps,
  provide,
  shallowRef,
  watchPostEffect,
  type InjectionKey,
  type PropType,
  type SlotsType,
  type VNodeChild,
} from "vue";
import { IconChevronRight } from "./icons.js";
import { Menu, menuParts, menuItemParts, useMenuSource, menuTriggerHooks } from "./menu.js";
import {
  partAttributes,
  sdkPart,
  type ComponentProps,
  type HtmlPart,
  type StyleXArgument,
  type StyledPart,
} from "./parts.js";

type Model = {
  active: () => boolean;
  expand: () => void;
};
const Context: InjectionKey<Model> = Symbol("ContextMenu");
type OpenChange = ComponentProps<typeof Menu.Root>["onOpenChange"];
export const ContextMenuRoot: StyledPart<typeof Menu.Root, { compact?: boolean }> = defineComponent(
  {
    name: "LensoContextMenu",
    inheritAttrs: false,
    props: { compact: Boolean, onOpenChange: Function as PropType<OpenChange> },
    setup(props, { attrs, slots }) {
      const expanded = shallowRef(false);
      provide(Context, {
        active: () => props.compact && !expanded.value,
        expand: () => {
          expanded.value = true;
        },
      });
      return () =>
        h(
          Menu.Root,
          {
            ...attrs,
            onOpenChange(open, details) {
              props.onOpenChange?.(open, details);
              if (open && !details.canceled) expanded.value = false;
            },
          },
          slots,
        );
    },
  },
) as unknown as StyledPart<typeof Menu.Root, { compact?: boolean }>;

const Trigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "context-menu-trigger",
  () => s.trigger,
);
export const ContextMenuTrigger: typeof Trigger = defineComponent({
  name: "LensoContextMenuTrigger",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const source = menuTriggerHooks();
    return () => h(Trigger, mergeProps({ tabindex: 0, ...attrs }, source), slots);
  },
}) as unknown as typeof Trigger;

type Appearance = {
  dim?: boolean;
  layout?: "vertical" | "horizontal";
  previewAlign?: "leading" | "trailing";
};
const Content: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "context-menu-content",
  () => s.host,
);
type ContentProps = ComponentProps<typeof Content> & Appearance;
type SlotState = { state: MenuContentState };
type ContentSlots = InstanceType<typeof Content>["$slots"] & {
  preview?: (scope: SlotState) => VNodeChild;
  bar?: (scope: SlotState) => VNodeChild;
};
export const ContextMenuContent = defineComponent({
  name: "LensoContextMenuContent",
  inheritAttrs: false,
  props: {
    dim: { type: Boolean, default: true },
    layout: String as PropType<Appearance["layout"]>,
    previewAlign: String as PropType<Appearance["previewAlign"]>,
  },
  slots: Object as SlotsType<ContentSlots>,
  setup(props, { attrs, slots }) {
    const model = inject(Context, undefined);
    return () =>
      h(
        Content,
        {
          align: "start",
          ...attrs,
          xstyle: [
            props.dim && s.dimmed,
            props.previewAlign === "trailing" && s.trailing,
            props.layout === "horizontal" &&
              (props.previewAlign === "trailing" ? s.horizontalTrailing : s.horizontal),
            attrs["xstyle"] as StyleXArgument,
          ],
        },
        {
          render: slots.render,
          default: (scope: SlotState) => {
            const compact = model?.active() && Boolean(slots.bar);
            return [
              slots.preview?.(scope),
              h(
                "div",
                {
                  ...stylex.attrs(
                    materialStyles.root,
                    materialStyles.accessible,
                    materialStyles.blur,
                    menuStyles.content,
                    s.panel,
                    s.popup,
                    compact && s.compactPopup,
                  ),
                  "data-lenso-slot": "menu-popup",
                  "data-open": scope.state.open ? "" : undefined,
                },
                compact
                  ? [
                      h("div", stylex.attrs(s.bar), [
                        slots.bar?.(scope),
                        h(
                          Menu.Item,
                          {
                            closeOnSelect: false,
                            "aria-label": "More actions",
                            onSelect: () => model?.expand(),
                          },
                          { default: () => h(IconChevronRight) },
                        ),
                      ]),
                    ]
                  : slots.default?.(scope),
              ),
            ];
          },
        },
      );
  },
}) as unknown as new () => Omit<InstanceType<typeof Content>, "$props" | "$slots"> & {
  $props: ContentProps;
  $slots: ContentSlots;
};

export const ContextMenuBarItem: StyledPart<typeof SdkItem> = sdkPart(
  SdkItem,
  "context-menu-bar-item",
  () => [menuStyles.barItem, s.barItem],
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

export const ContextMenuPreview: HtmlPart<"div"> = defineComponent({
  name: "LensoContextMenuPreview",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const trigger = useMenuSource();
    const preview = shallowRef<HTMLDivElement>();
    watchPostEffect((cleanup) => {
      const node = preview.value;
      const source = trigger?.current();
      const panel = node?.parentElement?.querySelector<HTMLElement>(
        '[data-lenso-slot="menu-popup"]',
      );
      if (node && source && panel) cleanup(presentContextPreview(node, source, panel, () => {}));
    });
    return () =>
      h(
        "div",
        {
          ...partAttributes("context-menu-preview", s.preview, {
            "aria-hidden": "true",
            inert: true,
            ...attrs,
          }),
          ref: preview,
        },
        slots["default"]?.(),
      );
  },
}) as unknown as HtmlPart<"div">;

const Item: typeof ContextMenuItem &
  Omit<typeof menuItemParts, "Root"> & {
    Root: typeof ContextMenuItem;
  } = Object.assign(ContextMenuItem, menuItemParts, { Root: ContextMenuItem });
export const ContextMenu: typeof ContextMenuRoot &
  Omit<typeof menuParts, "Root" | "Trigger" | "Content" | "Item" | "Separator" | "BarItem"> & {
    BarItem: typeof ContextMenuBarItem;
    Section: typeof Menu.Group;
    Preview: typeof ContextMenuPreview;
    Root: typeof ContextMenuRoot;
    Trigger: typeof ContextMenuTrigger;
    Content: typeof ContextMenuContent;
    Item: typeof Item;
    Separator: typeof ContextMenuSeparator;
  } = Object.assign(ContextMenuRoot, menuParts, {
  BarItem: ContextMenuBarItem,
  Section: Menu.Group,
  Preview: ContextMenuPreview,
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  Content: ContextMenuContent,
  Item,
  Separator: ContextMenuSeparator,
});
