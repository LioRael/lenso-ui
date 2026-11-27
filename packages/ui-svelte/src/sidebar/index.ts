import { Collapsible as SidebarDisclosure } from "@ui-sdk/svelte/collapsible";
import SidebarRoot from "./sidebar-root.svelte";
import SidebarHeader from "./sidebar-header.svelte";
import SidebarContent from "./sidebar-content.svelte";
import SidebarFooter from "./sidebar-footer.svelte";
import SidebarGroup from "./sidebar-group.svelte";
import SidebarLabel from "./sidebar-label.svelte";
import SidebarItem from "./sidebar-item.svelte";
import SidebarIcon from "./sidebar-icon.svelte";
import SidebarText from "./sidebar-text.svelte";
import SidebarAccessory from "./sidebar-accessory.svelte";
import SidebarDisclosureTrigger from "./sidebar-disclosure-trigger.svelte";
import SidebarDisclosurePanel from "./sidebar-disclosure-panel.svelte";
import SidebarDisclosureBody from "./sidebar-disclosure-body.svelte";

export {
  SidebarRoot,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarLabel,
  SidebarItem,
  SidebarIcon,
  SidebarText,
  SidebarAccessory,
  SidebarDisclosureTrigger,
  SidebarDisclosurePanel,
  SidebarDisclosureBody,
  SidebarDisclosure,
};
export const Sidebar: typeof SidebarRoot & {
  Root: typeof SidebarRoot;
  Header: typeof SidebarHeader;
  Content: typeof SidebarContent;
  Footer: typeof SidebarFooter;
  Group: typeof SidebarGroup;
  Label: typeof SidebarLabel;
  Item: typeof SidebarItem;
  Icon: typeof SidebarIcon;
  Text: typeof SidebarText;
  Accessory: typeof SidebarAccessory;
  Disclosure: typeof SidebarDisclosure;
  DisclosureTrigger: typeof SidebarDisclosureTrigger;
  DisclosurePanel: typeof SidebarDisclosurePanel;
  DisclosureBody: typeof SidebarDisclosureBody;
} = Object.assign(SidebarRoot, {
  Root: SidebarRoot,
  Header: SidebarHeader,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  Label: SidebarLabel,
  Item: SidebarItem,
  Icon: SidebarIcon,
  Text: SidebarText,
  Accessory: SidebarAccessory,
  Disclosure: SidebarDisclosure,
  DisclosureTrigger: SidebarDisclosureTrigger,
  DisclosurePanel: SidebarDisclosurePanel,
  DisclosureBody: SidebarDisclosureBody,
});
