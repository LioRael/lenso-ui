import { attachGlass } from "@lenso/glass";
import {
  bindTabBarMinimize,
  bindTabBarMotion,
  bindTabBarPress,
  bindTabBarScroll,
  restoreTabBarFocus,
} from "@lenso/glass/motion";
import { glassStyles } from "@lenso/tokens/glass";
import { knobMaterialStyles as knob } from "@lenso/tokens/materials";
import { tabBarStyles as s } from "@lenso/tokens/tab-bar";
import { tabsStyles } from "@lenso/tokens/tabs";
import { Button } from "@ui-sdk/vue/button";
import {
  defineComponent,
  h,
  inject,
  nextTick,
  provide,
  shallowRef,
  useId,
  watch,
  watchPostEffect,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type InjectionKey,
  type PropType,
  type SlotsType,
  type VNode,
  type VNodeChild,
} from "vue";
import { Glass } from "./glass.js";
import {
  partAttributes,
  sdkPart,
  type ComponentProps,
  type StyleXArgument,
  type StyledPart,
} from "./parts.js";

export type TabBarLayout = "phone" | "tablet" | "vertical";
type Visibility = {
  elastic: () => boolean;
  minimized: () => boolean;
  expandLabel: () => string;
  changeMinimized: (value: boolean) => void;
};
const Layout: InjectionKey<() => TabBarLayout> = Symbol("TabBarLayout");
const VisibilityContext: InjectionKey<Visibility> = Symbol("TabBarVisibility");
const Separate: InjectionKey<() => boolean> = Symbol("TabBarSeparate");
const useLayout = () => inject(Layout, () => "phone");
const Action: StyledPart<typeof Button> = sdkPart(Button, "tab-bar-button", () => s.item);

const Nav = defineComponent({
  name: "LensoTabBar",
  inheritAttrs: false,
  props: {
    layout: { type: String as PropType<TabBarLayout>, default: "phone" },
    elastic: { type: Boolean, default: true },
    minimized: { type: Boolean, default: undefined },
    defaultMinimized: Boolean,
    onMinimizedChange: Function as PropType<(value: boolean) => void>,
    autoMinimize: [Boolean, String] as PropType<boolean | "up" | "down">,
    scrollTarget: [Object, Function] as PropType<
      HTMLElement | (() => HTMLElement | null | undefined)
    >,
    expandLabel: { type: String, default: "Expand navigation" },
  },
  emits: { "update:minimized": (_value: boolean) => true },
  setup(props, { attrs, emit, slots }) {
    const element = shallowRef<HTMLElement>();
    const local = shallowRef(props.defaultMinimized);
    const minimized = () => props.minimized ?? local.value;
    function changeMinimized(value: boolean) {
      if (value === minimized()) return;
      if (props.minimized === undefined) local.value = value;
      props.onMinimizedChange?.(value);
      emit("update:minimized", value);
    }
    provide(Layout, () => props.layout);
    provide(VisibilityContext, {
      elastic: () => props.elastic,
      minimized,
      expandLabel: () => props.expandLabel,
      changeMinimized,
    });
    watchPostEffect((cleanup) => {
      const node = element.value;
      const direction = props.autoMinimize;
      const target =
        typeof props.scrollTarget === "function" ? props.scrollTarget() : props.scrollTarget;
      if (!node || !direction || (props.scrollTarget !== undefined && !target)) return;
      const stop = bindTabBarScroll(
        node,
        target ?? undefined,
        direction === "up" ? "up" : "down",
        minimized(),
        changeMinimized,
      );
      if (stop) cleanup(stop);
    });
    return () =>
      h(
        "nav",
        {
          ...partAttributes(
            "tab-bar",
            [
              s.root,
              props.layout === "phone" && s.phoneRoot,
              props.layout === "vertical" && s.verticalRoot,
            ],
            {
              ...attrs,
              "data-minimized": minimized() ? "" : undefined,
              "data-layout": props.layout,
            },
          ),
          ref: element,
        },
        slots["default"]?.(),
      );
  },
});
export const TabBarRoot: StyledPart<typeof Nav, HTMLAttributes> = Nav as unknown as StyledPart<
  typeof Nav,
  HTMLAttributes
>;
export type TabBarRootProps = ComponentProps<typeof TabBarRoot>;

const Group = defineComponent({
  name: "LensoTabBarGroup",
  inheritAttrs: false,
  props: { separate: Boolean },
  setup(props, { attrs, slots }) {
    const layout = useLayout();
    const visibility = inject(VisibilityContext, undefined);
    const minimized = () => !!visibility?.minimized() && !props.separate;
    const group = shallowRef<HTMLDivElement>();
    const lens = shallowRef<HTMLSpanElement>();
    const list = shallowRef<HTMLUListElement>();
    const expand = shallowRef<HTMLElement>();
    const animation = shallowRef<ReturnType<typeof bindTabBarMinimize>>();
    const listId = useId();
    let restoreFocus = false;
    let listHadFocus = false;
    provide(Separate, () => props.separate);

    watchPostEffect((cleanup) => {
      if (group.value && (visibility?.elastic() ?? true)) cleanup(bindTabBarPress(group.value));
    });
    watchPostEffect((cleanup) => {
      if (lens.value) cleanup(attachGlass(lens.value, { liveGeometry: true }));
    });
    watchPostEffect((cleanup) => {
      if (!group.value) return;
      const detached = props.separate;
      const orientation = layout();
      const binding = bindTabBarMinimize(group.value, detached, orientation);
      const stop = detached ? undefined : bindTabBarMotion(group.value, orientation === "vertical");
      animation.value = binding;
      cleanup(() => {
        stop?.();
        binding?.destroy();
      });
    });
    watchPostEffect(() => animation.value?.setMinimized(minimized()));
    watch(
      minimized,
      (collapsed, _, cleanup) => {
        let active = true;
        let stop: (() => void) | undefined;
        cleanup(() => {
          active = false;
          stop?.();
        });
        if (collapsed) {
          const hadFocus =
            listHadFocus || list.value?.contains(list.value.ownerDocument.activeElement);
          listHadFocus = false;
          if (hadFocus)
            void nextTick(() => {
              if (active) expand.value?.focus({ preventScroll: true });
            });
        } else if (restoreFocus) {
          restoreFocus = false;
          void nextTick(() => {
            if (active && list.value) stop = restoreTabBarFocus(list.value);
          });
        }
      },
      { flush: "sync" },
    );

    const indicator = () =>
      h(
        "span",
        partAttributes("tab-bar-indicator", [glassStyles.hotspot, s.indicator], {
          "aria-hidden": "true",
          inert: true,
        }),
        [
          h(
            "span",
            partAttributes(
              "tab-bar-refraction",
              [tabsStyles.refraction, s.indicatorRefraction],
              {},
            ),
            [
              h("span", {
                ...partAttributes(
                  "tab-bar-optical-lens",
                  [knob.layer, knob.toggle, knob.controlEdge],
                  {
                    "aria-hidden": "true",
                    "data-knob-material": "toggle",
                  },
                ),
                ref: lens,
              }),
              h(
                "span",
                partAttributes("tab-bar-optical-face", knob.face, { "aria-hidden": "true" }),
              ),
            ],
          ),
        ],
      );
    const highlight = () =>
      h(
        "span",
        partAttributes("tab-bar-highlight", s.highlight, {
          "aria-hidden": "true",
          inert: true,
        }),
        [
          h("span", partAttributes("tab-bar-highlight-ring", s.highlightClip, {}), [
            h("span", partAttributes("tab-bar-highlight-optics", s.highlightOptics, {}), [
              h("span", partAttributes("tab-bar-highlight-row", s.highlightRow, {})),
            ]),
          ]),
          h("span", partAttributes("tab-bar-highlight-centre", s.highlightClip, {}), [
            h("span", partAttributes("tab-bar-highlight-centre-row", s.highlightRow, {})),
          ]),
        ],
      );

    return () => {
      const mode = layout();
      const detached = props.separate;
      const collapsed = minimized();
      const elastic = visibility?.elastic() ?? true;
      return h(
        "div",
        {
          ...partAttributes(
            "tab-bar-group",
            [
              s.group,
              mode === "phone"
                ? s.phoneGroup
                : mode === "vertical"
                  ? s.verticalGroup
                  : s.tabletGroup,
              elastic && s.elastic,
              detached && s.separate,
            ],
            {
              ...attrs,
              "data-tab-bar-group": "",
              "data-minimized": collapsed ? "" : undefined,
              "data-layout": mode,
              "data-separate": detached ? "" : undefined,
            },
          ),
          ref: group,
        },
        [
          h(Glass, {
            "aria-hidden": "true",
            "data-material": "glass-small",
            "data-material-resting": "",
            xstyle: [s.material, mode !== "phone" && s.tabletMaterial],
          }),
          !detached && indicator(),
          !detached && highlight(),
          h(
            "ul",
            {
              ...partAttributes(
                "tab-bar-list",
                [
                  s.list,
                  mode === "vertical" && s.verticalList,
                  mode === "tablet" && s.tabletList,
                  mode === "tablet" && detached && s.tabletSeparateList,
                ],
                {
                  "data-tab-bar-list": "",
                  id: listId,
                  "aria-hidden": collapsed ? "true" : undefined,
                  inert: collapsed,
                },
              ),
              ref: list,
              onFocusin: () => {
                listHadFocus = true;
              },
              onFocusout: (event: FocusEvent) => {
                if (
                  event.relatedTarget instanceof Node &&
                  !list.value?.contains(event.relatedTarget)
                )
                  listHadFocus = false;
              },
            },
            slots["default"]?.(),
          ),
          collapsed &&
            h(
              Action,
              {
                "data-tab-bar-expand": "",
                "aria-label": visibility?.expandLabel() ?? "Expand navigation",
                "aria-expanded": "false",
                "aria-controls": listId,
                xstyle: s.expand,
                onVnodeMounted({ el }: VNode) {
                  if (el instanceof HTMLElement) expand.value = el;
                },
                onVnodeBeforeUnmount() {
                  expand.value = undefined;
                },
                onFocus: () => {
                  restoreFocus = true;
                },
                onBlur: (event: FocusEvent) => {
                  if (
                    event.relatedTarget &&
                    event.relatedTarget !== group.value?.ownerDocument.body
                  )
                    restoreFocus = false;
                },
                onClick: () => {
                  restoreFocus = true;
                  visibility?.changeMinimized(false);
                },
              },
              { default: () => h("span", { "aria-hidden": "true" }, "⋯") },
            ),
        ],
      );
    };
  },
});
export const TabBarGroup: StyledPart<typeof Group, HTMLAttributes> = Group as unknown as StyledPart<
  typeof Group,
  HTMLAttributes
>;
export type TabBarGroupProps = ComponentProps<typeof TabBarGroup>;

type IconProps = { icon?: VNodeChild | (() => VNodeChild); iconOnly?: boolean };
type ItemSlots = { icon?: () => VNodeChild; default?: () => VNodeChild };
const iconProps = {
  icon: [Object, String, Function] as PropType<IconProps["icon"]>,
  iconOnly: { type: Boolean, default: undefined },
};
function useItem(props: IconProps, slots: ItemSlots) {
  const layout = useLayout();
  const separate = inject(Separate, () => false);
  const iconOnly = () => props.iconOnly ?? (layout() === "vertical" || separate());
  const icon = () =>
    slots["icon"]?.() ?? (typeof props.icon === "function" ? props.icon() : props.icon);
  return {
    hasIcon: () => !!slots["icon"] || !!props.icon,
    styles: () => [
      layout() === "tablet" && s.tabletItem,
      layout() === "vertical" && s.verticalItem,
      iconOnly() && s.iconOnlyItem,
    ],
    wrap: (child: VNode) =>
      h(
        "li",
        partAttributes(
          "tab-bar-item-container",
          [
            s.itemContainer,
            layout() === "tablet" && s.tabletItemContainer,
            separate() && s.separateItemContainer,
          ],
          {},
        ),
        [child],
      ),
    content: () => [
      (slots["icon"] || props.icon) &&
        h(
          "span",
          partAttributes(
            "tab-bar-item-icon",
            [
              s.icon,
              layout() === "tablet" && s.tabletIcon,
              layout() === "vertical" && s.verticalIcon,
            ],
            { "aria-hidden": "true", "data-tab-bar-content": "" },
          ),
          [icon()],
        ),
      h(
        "span",
        partAttributes("tab-bar-item-label", [s.label, iconOnly() && s.visuallyHidden], {
          "data-tab-bar-content": "",
        }),
        [slots["default"]?.()],
      ),
    ],
  };
}

const Link = defineComponent({
  name: "LensoTabBarLink",
  inheritAttrs: false,
  props: { ...iconProps, isCurrent: Boolean, disabled: Boolean },
  slots: Object as SlotsType<ItemSlots>,
  setup(props, { attrs, slots }) {
    const item = useItem(props, slots);
    return () => {
      const aria = attrs["aria-current"];
      const current = aria == null ? props.isCurrent : aria !== false && aria !== "false";
      return item.wrap(
        h(
          "a",
          partAttributes("tab-bar-link", [s.item, item.styles(), current && s.current], {
            ...attrs,
            href: props.disabled ? undefined : attrs["href"],
            "aria-current": aria ?? (current ? "page" : undefined),
            role: attrs["role"] ?? (props.disabled ? "link" : undefined),
            "aria-disabled": props.disabled ? "true" : attrs["aria-disabled"],
            tabindex: props.disabled ? -1 : attrs["tabindex"],
            "data-tab-bar-destination": "",
            "data-tab-bar-has-icon": item.hasIcon() ? "" : undefined,
            "data-tab-bar-item": "",
            "data-current": current ? "" : undefined,
          }),
          item.content(),
        ),
      );
    };
  },
});
export const TabBarLink: StyledPart<typeof Link, AnchorHTMLAttributes> =
  Link as unknown as StyledPart<typeof Link, AnchorHTMLAttributes>;
export type TabBarLinkProps = ComponentProps<typeof TabBarLink>;

export const TabBarButton = defineComponent({
  name: "LensoTabBarButton",
  inheritAttrs: false,
  props: iconProps,
  slots: Object as SlotsType<ItemSlots>,
  setup(props, { attrs, slots }) {
    const item = useItem(props, slots);
    return () =>
      item.wrap(
        h(
          Action,
          {
            ...attrs,
            "data-tab-bar-item": "",
            xstyle: [item.styles(), attrs["xstyle"] as StyleXArgument],
          },
          { ...slots, default: item.content },
        ),
      );
  },
}) as unknown as new () => Omit<InstanceType<typeof Action>, "$props" | "$slots"> & {
  $props: ComponentProps<typeof Action> & IconProps;
  $slots: ItemSlots;
};
export type TabBarButtonProps = ComponentProps<typeof TabBarButton>;
export const TabBar: typeof TabBarRoot & {
  Root: typeof TabBarRoot;
  Group: typeof TabBarGroup;
  Link: typeof TabBarLink;
  Button: typeof TabBarButton;
} = Object.assign(TabBarRoot, {
  Root: TabBarRoot,
  Group: TabBarGroup,
  Link: TabBarLink,
  Button: TabBarButton,
});
