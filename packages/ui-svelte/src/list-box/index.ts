import { ListboxItems as ListBoxItems } from "@ui-sdk/svelte/listbox";
import ListBoxRoot from "./list-box-root.svelte";
import ListBoxItem from "./list-box-item.svelte";
import ListBoxItemIndicator from "./list-box-item-indicator.svelte";
import ListBoxSection from "./list-box-section.svelte";
import ListBoxSectionLabel from "./list-box-section-label.svelte";
import ListBoxSeparator from "./list-box-separator.svelte";

export {
  ListBoxRoot,
  ListBoxItem,
  ListBoxItemIndicator,
  ListBoxSection,
  ListBoxSectionLabel,
  ListBoxSeparator,
  ListBoxItems,
};
const Item: typeof ListBoxItem & {
  Root: typeof ListBoxItem;
  Indicator: typeof ListBoxItemIndicator;
} = Object.assign(ListBoxItem, { Root: ListBoxItem, Indicator: ListBoxItemIndicator });
const Section: typeof ListBoxSection & { Root: typeof ListBoxSection } = Object.assign(
  ListBoxSection,
  { Root: ListBoxSection },
);
export const ListBox: typeof ListBoxRoot & {
  Root: typeof ListBoxRoot;
  Item: typeof Item;
  ItemIndicator: typeof ListBoxItemIndicator;
  Section: typeof Section;
  SectionLabel: typeof ListBoxSectionLabel;
  Separator: typeof ListBoxSeparator;
  Items: typeof ListBoxItems;
} = Object.assign(ListBoxRoot, {
  Root: ListBoxRoot,
  Item,
  ItemIndicator: ListBoxItemIndicator,
  Section,
  SectionLabel: ListBoxSectionLabel,
  Separator: ListBoxSeparator,
  Items: ListBoxItems,
});

export { createListboxController, type ListboxController } from "@ui-sdk/core/listbox";
