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
} from "@ui-sdk/solid/listbox";
import { createComponent, type ComponentProps } from "solid-js";
import { sdkPart, type SlotProps, type StyledPart } from "./parts.js";

export function ListBoxRoot<T = string, Multiple extends boolean | undefined = false>(
  props: Parameters<typeof SdkRoot<T, Multiple>>[0] & SlotProps,
) {
  return sdkPart(SdkRoot<T, Multiple>, "list-box", () => listBoxStyles.root)(props);
}
export const ListBoxItem: StyledPart<typeof SdkItem, { variant?: "default" | "danger" }> = sdkPart<
  ComponentProps<typeof SdkItem>,
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
export const ListBoxItems = (props: ComponentProps<typeof SdkItems>) =>
  createComponent(SdkItems, props);

export const ListBox: typeof ListBoxRoot & {
  Root: typeof ListBoxRoot;
  Item: typeof ListBoxItem;
  ItemIndicator: typeof ListBoxItemIndicator;
  Section: typeof ListBoxSection;
  SectionLabel: typeof ListBoxSectionLabel;
  Separator: typeof ListBoxSeparator;
  Items: typeof ListBoxItems;
} = Object.assign(ListBoxRoot, {
  Root: ListBoxRoot,
  Item: ListBoxItem,
  ItemIndicator: ListBoxItemIndicator,
  Section: ListBoxSection,
  SectionLabel: ListBoxSectionLabel,
  Separator: ListBoxSeparator,
  Items: ListBoxItems,
});
