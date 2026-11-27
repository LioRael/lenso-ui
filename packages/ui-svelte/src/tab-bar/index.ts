import TabBarRoot from "./tab-bar.svelte";
import TabBarGroup from "./tab-bar-group.svelte";
import TabBarLink from "./tab-bar-link.svelte";
import TabBarButton from "./tab-bar-button.svelte";

export { TabBarRoot, TabBarGroup, TabBarLink, TabBarButton };
export type { TabBarLayout } from "./context.js";
export type { TabBarRootProps } from "./tab-bar.svelte";
export type { TabBarGroupProps } from "./tab-bar-group.svelte";
export type { TabBarLinkProps } from "./tab-bar-link.svelte";
export type { TabBarButtonProps } from "./tab-bar-button.svelte";
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
