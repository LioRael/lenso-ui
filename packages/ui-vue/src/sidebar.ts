import { sidebarStyles } from "@lenso/tokens/sidebar";
import {
  Collapsible as SdkDisclosure,
  CollapsibleTrigger as SdkDisclosureTrigger,
  CollapsiblePanel as SdkDisclosurePanel,
} from "@ui-sdk/vue/collapsible";
import { forwardPart, htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const SidebarRoot = htmlPart("aside", "sidebar", () => sidebarStyles.root);
export const SidebarHeader = htmlPart("header", "sidebar-header", () => sidebarStyles.header);
export const SidebarContent = htmlPart("nav", "sidebar-content", () => sidebarStyles.content);
export const SidebarFooter = htmlPart("footer", "sidebar-footer", () => sidebarStyles.footer);
export const SidebarGroup = htmlPart("section", "sidebar-group", () => sidebarStyles.group);
export const SidebarLabel = htmlPart("p", "sidebar-label", () => sidebarStyles.label);
export const SidebarItem = htmlPart<"a", { selected?: boolean; indent?: number }>(
  "a",
  "sidebar-item",
  (props) => [
    sidebarStyles.item,
    props.selected && sidebarStyles.selected,
    sidebarStyles.indent(props.indent ?? 0),
  ],
  "selected",
  "indent",
);
export const SidebarIcon = htmlPart("span", "sidebar-icon", () => sidebarStyles.icon);
export const SidebarText = htmlPart("span", "sidebar-text", () => sidebarStyles.text);
export const SidebarAccessory = htmlPart(
  "span",
  "sidebar-accessory",
  () => sidebarStyles.accessory,
);
export const SidebarDisclosure: typeof SdkDisclosure = forwardPart(SdkDisclosure);
export const SidebarDisclosureTrigger: StyledPart<typeof SdkDisclosureTrigger> = sdkPart(
  SdkDisclosureTrigger,
  "sidebar-disclosure-trigger",
  () => [sidebarStyles.item, sidebarStyles.disclosureTrigger],
);
export const SidebarDisclosurePanel: StyledPart<typeof SdkDisclosurePanel> = sdkPart(
  SdkDisclosurePanel,
  "sidebar-disclosure-panel",
  () => sidebarStyles.disclosurePanel,
);
export const SidebarDisclosureBody = htmlPart(
  "div",
  "sidebar-disclosure-body",
  () => sidebarStyles.disclosureBody,
);

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
