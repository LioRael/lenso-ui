import { bindTabsOverflow, type OverflowTab } from "@lenso/glass/motion";
import { menuStyles } from "@lenso/tokens/menu";
import { tabsStyles } from "@lenso/tokens/tabs";
import {
  Tabs as SdkRoot,
  TabsList as SdkList,
  TabsTab as SdkTab,
  TabsIndicator as SdkIndicator,
  TabsPanel as SdkPanel,
} from "@ui-sdk/solid/tabs";
import {
  createContext,
  createEffect,
  createSignal,
  For,
  omit,
  Show,
  useContext,
  type ComponentProps,
} from "solid-js";
import { Menu } from "./menu.js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

const Orientation = createContext<() => "horizontal" | "vertical">(() => "horizontal");
const Root: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "tabs", (props) => [
  tabsStyles.root,
  tabsStyles[props.orientation ?? "horizontal"],
]);
const Container = htmlPart("div", "tabs-list-container", () => tabsStyles.listContainer);
const List: StyledPart<typeof SdkList, { size?: "md" | "lg" }> = sdkPart<
  ComponentProps<typeof SdkList>,
  { size?: "md" | "lg" }
>(
  SdkList,
  "tabs-list",
  (props) => [tabsStyles.list, props.size === "lg" && tabsStyles.large],
  "size",
);
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

export function TabsRoot(props: ComponentProps<typeof Root>) {
  return (
    <Orientation value={() => props.orientation ?? "horizontal"}>
      <Root {...props} />
    </Orientation>
  );
}

export function TabList(props: ComponentProps<typeof List>) {
  const orientation = useContext(Orientation);
  return (
    <List
      {...omit(props, "xstyle")}
      xstyle={[
        orientation() === "horizontal" ? tabsStyles.listHorizontal : tabsStyles.listVertical,
        props.xstyle,
      ]}
    />
  );
}

export type TabListContainerProps = ComponentProps<typeof Container> & { overflowLabel?: string };

export function TabsListContainer(props: TabListContainerProps) {
  const orientation = useContext(Orientation);
  const [host, setHost] = createSignal<HTMLDivElement>();
  const [overflow, setOverflow] = createSignal<OverflowTab[]>([]);
  let selectedFromMenu = false;
  createEffect(
    () => [host(), orientation()] as const,
    ([node, direction]) => {
      if (node && direction === "horizontal") return bindTabsOverflow(node, setOverflow);
      setOverflow([]);
    },
  );

  const label = () => props.overflowLabel ?? "More tabs";
  return (
    <Container
      {...omit(props, "ref", "children", "xstyle", "overflowLabel")}
      ref={[setHost, props.ref]}
      xstyle={[
        orientation() === "horizontal"
          ? tabsStyles.overflowContainer
          : tabsStyles.verticalContainer,
        props.xstyle,
      ]}
    >
      <Show when={orientation() === "horizontal"} fallback={props.children}>
        <OverflowRow>
          {props.children}
          <Show when={overflow().length > 0}>
            <Menu
              onOpenChange={(open) => {
                if (open) selectedFromMenu = false;
              }}
            >
              <Menu.Trigger
                aria-label={label()}
                xstyle={[menuStyles.expand, tabsStyles.overflowTrigger]}
              >
                <span aria-hidden="true">⋯</span>
              </Menu.Trigger>
              <Menu.Content
                aria-label={label()}
                align="end"
                sideOffset={8}
                finalFocus={() => {
                  if (!selectedFromMenu) return undefined;
                  const active = host()?.querySelector<HTMLElement>(
                    '[data-lenso-slot="tabs-tab"][aria-selected="true"]',
                  );
                  active?.removeAttribute("data-tabs-overflow");
                  return active;
                }}
              >
                <For each={overflow()} keyed={(tab) => tab.node}>
                  {(tab) => (
                    <Menu.Item
                      disabled={tab().disabled}
                      onClick={() => {
                        selectedFromMenu = true;
                        tab().node.click();
                      }}
                    >
                      {tab().label}
                    </Menu.Item>
                  )}
                </For>
              </Menu.Content>
            </Menu>
          </Show>
        </OverflowRow>
      </Show>
    </Container>
  );
}

const OverflowRow = htmlPart("div", "tabs-overflow-row", () => tabsStyles.overflowRow);

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

export const TabListContainer: typeof Tabs.ListContainer = Tabs.ListContainer;
