import { bindTabsOverflow, type OverflowTab } from "@lenso/glass/motion";
import { menuStyles } from "@lenso/tokens/menu";
import { tabsStyles } from "@lenso/tokens/tabs";
import {
  Tabs as SdkRoot,
  TabsList as SdkList,
  TabsTab as SdkTab,
  TabsIndicator as SdkIndicator,
  TabsPanel as SdkPanel,
} from "@ui-sdk/vue/tabs";
import {
  defineComponent,
  h,
  inject,
  provide,
  shallowRef,
  watchPostEffect,
  type InjectionKey,
  type PropType,
} from "vue";
import { Menu } from "./menu.js";
import {
  htmlPart,
  partAttributes,
  sdkPart,
  type ComponentProps,
  type HtmlPart,
  type StyleXArgument,
  type StyledPart,
} from "./parts.js";

type Orientation = "horizontal" | "vertical";
const OrientationContext: InjectionKey<() => Orientation> = Symbol("TabsOrientation");
const BaseTabs: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "tabs", (props) => [
  tabsStyles.root,
  tabsStyles[props.orientation ?? "horizontal"],
]);
export const TabsRoot: typeof BaseTabs = defineComponent({
  name: "LensoTabs",
  inheritAttrs: false,
  props: { orientation: String as PropType<Orientation> },
  setup(props, { attrs, slots }) {
    provide(OrientationContext, () => props.orientation ?? "horizontal");
    return () => h(BaseTabs, { ...attrs, orientation: props.orientation }, slots);
  },
}) as unknown as typeof BaseTabs;

type ListAppearance = { size?: "md" | "lg" };
const BaseList: StyledPart<typeof SdkList, ListAppearance> = sdkPart<
  typeof SdkList,
  ListAppearance
>(
  SdkList,
  "tabs-list",
  (props) => [tabsStyles.list, props.size === "lg" && tabsStyles.large],
  "size",
);
export const TabList: typeof BaseList = defineComponent({
  name: "LensoTabList",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const orientation = inject(OrientationContext, () => "horizontal" as const);
    return () =>
      h(
        BaseList,
        {
          ...attrs,
          xstyle: [
            orientation() === "horizontal" ? tabsStyles.listHorizontal : tabsStyles.listVertical,
            attrs["xstyle"] as StyleXArgument,
          ],
        },
        slots,
      );
  },
}) as unknown as typeof BaseList;

const OverflowRow = htmlPart("div", "tabs-overflow-row", () => tabsStyles.overflowRow);
type Container = HtmlPart<"div", { overflowLabel?: string }>;
export const TabsListContainer: Container = defineComponent({
  name: "LensoTabsListContainer",
  inheritAttrs: false,
  props: { overflowLabel: { type: String, default: "More tabs" } },
  setup(props, { attrs, slots }) {
    const orientation = inject(OrientationContext, () => "horizontal" as const);
    const host = shallowRef<HTMLDivElement>();
    const overflow = shallowRef<OverflowTab[]>([]);
    let selectedFromMenu = false;
    watchPostEffect((cleanup) => {
      if (host.value && orientation() === "horizontal") {
        const dispose = bindTabsOverflow(host.value, (tabs) => {
          overflow.value = tabs;
        });
        if (dispose) cleanup(dispose);
      } else {
        overflow.value = [];
      }
    });

    function moreTabs() {
      return h(
        Menu,
        {
          onOpenChange: (open) => {
            if (open) selectedFromMenu = false;
          },
        },
        {
          default: () => [
            h(
              Menu.Trigger,
              {
                "aria-label": props.overflowLabel,
                xstyle: [menuStyles.expand, tabsStyles.overflowTrigger],
              },
              { default: () => h("span", { "aria-hidden": "true" }, "⋯") },
            ),
            h(
              Menu.Content,
              {
                "aria-label": props.overflowLabel,
                align: "end",
                sideOffset: 8,
                finalFocus: () => {
                  if (!selectedFromMenu) return undefined;
                  const active = host.value?.querySelector<HTMLElement>(
                    '[data-lenso-slot="tabs-tab"][aria-selected="true"]',
                  );
                  active?.removeAttribute("data-tabs-overflow");
                  return active;
                },
              },
              {
                default: () =>
                  overflow.value.map((tab) =>
                    h(
                      Menu.Item,
                      {
                        key: tab.node.id,
                        disabled: tab.disabled,
                        onSelect: () => {
                          selectedFromMenu = true;
                          tab.node.click();
                        },
                      },
                      { default: () => tab.label },
                    ),
                  ),
              },
            ),
          ],
        },
      );
    }

    return () => {
      const horizontal = orientation() === "horizontal";
      return h(
        "div",
        {
          ...partAttributes(
            "tabs-list-container",
            [
              tabsStyles.listContainer,
              horizontal ? tabsStyles.overflowContainer : tabsStyles.verticalContainer,
            ],
            attrs,
          ),
          ref: host,
        },
        horizontal
          ? [
              h(OverflowRow, null, {
                default: () => [slots["default"]?.(), overflow.value.length > 0 && moreTabs()],
              }),
            ]
          : slots["default"]?.(),
      );
    };
  },
}) as unknown as Container;
export type TabListContainerProps = ComponentProps<typeof TabsListContainer>;
export const TabListContainer = TabsListContainer;
export const TabRoot: StyledPart<typeof SdkTab> = sdkPart(SdkTab, "tabs-tab", () => [
  tabsStyles.tab,
  tabsStyles.initialTab,
]);
export const TabIndicator: StyledPart<typeof SdkIndicator> = sdkPart(
  SdkIndicator,
  "tabs-indicator",
  () => [tabsStyles.indicator, tabsStyles.initialIndicator],
);
export const TabPanel: StyledPart<typeof SdkPanel> = sdkPart(
  SdkPanel,
  "tab-panel",
  () => tabsStyles.panel,
);
export const TabSeparator = htmlPart("span", "tabs-separator", () => tabsStyles.separator);

export const Tabs: typeof TabsRoot & {
  Root: typeof TabsRoot;
  ListContainer: typeof TabsListContainer;
  List: typeof TabList;
  Tab: typeof TabRoot;
  Indicator: typeof TabIndicator;
  Panel: typeof TabPanel;
  Separator: typeof TabSeparator;
} = Object.assign(TabsRoot, {
  Root: TabsRoot,
  ListContainer: TabsListContainer,
  List: TabList,
  Tab: TabRoot,
  Indicator: TabIndicator,
  Panel: TabPanel,
  Separator: TabSeparator,
});
