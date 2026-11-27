import ListRoot from "./list-root.svelte";
import ListItem from "./list-item.svelte";
import ListContent from "./list-content.svelte";
import ListTitle from "./list-title.svelte";
import ListDescription from "./list-description.svelte";
import ListLeading from "./list-leading.svelte";
import ListTrailing from "./list-trailing.svelte";
import ListSeparator from "./list-separator.svelte";
import ListAction from "./list-action.svelte";
import ListSection from "./list-section.svelte";

export {
  ListRoot,
  ListItem,
  ListContent,
  ListTitle,
  ListDescription,
  ListLeading,
  ListTrailing,
  ListSeparator,
  ListAction,
  ListSection,
};
export { createListController, type ListKey } from "@lenso/primitives/list/core";
export type { ListRootProps } from "./list-root.svelte";
export type { ListItemProps } from "./list-item.svelte";

export const List: typeof ListRoot & {
  Root: typeof ListRoot;
  Item: typeof ListItem;
  Content: typeof ListContent;
  Title: typeof ListTitle;
  Description: typeof ListDescription;
  Leading: typeof ListLeading;
  Trailing: typeof ListTrailing;
  Separator: typeof ListSeparator;
  Action: typeof ListAction;
  Section: typeof ListSection;
} = Object.assign(ListRoot, {
  Root: ListRoot,
  Item: ListItem,
  Content: ListContent,
  Title: ListTitle,
  Description: ListDescription,
  Leading: ListLeading,
  Trailing: ListTrailing,
  Separator: ListSeparator,
  Action: ListAction,
  Section: ListSection,
});
