import {
  listBoxStyles,
  listBoxItemStyles,
  listBoxSectionStyles,
  listBoxSectionLabelStyles,
} from "@lenso/tokens/list-box";
import { menuStyles } from "@lenso/tokens/menu";
import {
  Listbox as SdkRoot,
  ListboxItem as SdkItem,
  ListboxItemIndicator as SdkItemIndicator,
  ListboxGroup as SdkSection,
  ListboxGroupLabel as SdkSectionLabel,
  ListboxSeparator as SdkSeparator,
  ListboxItems as SdkItems,
} from "@ui-sdk/vue/listbox";
import { forwardPart, sdkPart, type StyledPart } from "./parts.js";

export const ListBoxRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "list-box",
  () => listBoxStyles.root,
);
export const ListBoxItem: StyledPart<typeof SdkItem, { variant?: "default" | "danger" }> = sdkPart<
  typeof SdkItem,
  { variant?: "default" | "danger" }
>(
  SdkItem,
  "list-box-item",
  (props) => [
    listBoxItemStyles.root,
    props.disabled && listBoxItemStyles.disabled,
    props.variant === "danger" && listBoxItemStyles.danger,
  ],
  "variant",
);
export const ListBoxItemIndicator: StyledPart<typeof SdkItemIndicator> = sdkPart(
  SdkItemIndicator,
  "list-box-item-indicator",
  () => listBoxItemStyles.indicator,
);
export const ListBoxSection: StyledPart<typeof SdkSection> = sdkPart(
  SdkSection,
  "list-box-section",
  () => listBoxSectionStyles.root,
);
export const ListBoxSectionLabel: StyledPart<typeof SdkSectionLabel> = sdkPart(
  SdkSectionLabel,
  "list-box-section-label",
  () => listBoxSectionLabelStyles.root,
);
export const ListBoxSeparator: StyledPart<typeof SdkSeparator> = sdkPart(
  SdkSeparator,
  "list-box-separator",
  () => menuStyles.separator,
);
export const ListBoxItems: typeof SdkItems = forwardPart(SdkItems);

const Item: typeof ListBoxItem & {
  Root: typeof ListBoxItem;
  Indicator: typeof ListBoxItemIndicator;
} = Object.assign(ListBoxItem, { Root: ListBoxItem, Indicator: ListBoxItemIndicator });
const Section: typeof ListBoxSection & {
  Root: typeof ListBoxSection;
} = Object.assign(ListBoxSection, { Root: ListBoxSection });
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
