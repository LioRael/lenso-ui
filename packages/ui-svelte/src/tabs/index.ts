import TabsRoot from "./root.svelte";
import TabsListContainer from "./list-container.svelte";
import TabList from "./list.svelte";
import TabRoot from "./tab-root.svelte";
import TabIndicator from "./tab-indicator.svelte";
import TabPanel from "./tab-panel.svelte";
import TabSeparator from "./tab-separator.svelte";

export { TabsRoot, TabsListContainer, TabList, TabRoot, TabIndicator, TabPanel, TabSeparator };
export type { TabListContainerProps } from "./list-container.svelte";
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
