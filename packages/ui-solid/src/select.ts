import { selectStyles } from "@lenso/tokens/select";
import { menuStyles, menuItemStyles, menuSectionStyles } from "@lenso/tokens/menu";
import { materialStyles } from "@lenso/tokens/materials";
import { popupButtonStyles } from "@lenso/tokens/popup-button";
import {
  Select as SdkRoot,
  SelectTrigger as SdkTrigger,
  SelectContent as SdkContent,
  SelectList as SdkList,
  SelectItem as SdkItem,
  SelectItemText as SdkItemText,
  SelectLabel as SdkLabel,
  SelectGroup as SdkGroup,
  SelectGroupLabel as SdkGroupLabel,
  SelectSeparator as SdkSeparator,
  SelectArrow as SdkArrow,
  SelectItems as SdkItems,
  SelectValue as SdkValue,
  SelectItemIndicator as SdkItemIndicator,
} from "@ui-sdk/solid/select";
import { createComponent, type ComponentProps } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export function SelectRoot<T = string, Multiple extends boolean | undefined = false>(
  props: Parameters<typeof SdkRoot<T, Multiple>>[0],
) {
  return createComponent(SdkRoot<T, Multiple>, props);
}
export const SelectTrigger: StyledPart<typeof SdkTrigger, { variant?: "primary" | "secondary" }> =
  sdkPart<ComponentProps<typeof SdkTrigger>, { variant?: "primary" | "secondary" }>(
    SdkTrigger,
    "select-trigger",
    (props) => [
      popupButtonStyles.root,
      selectStyles.validation,
      props.variant === "secondary" && selectStyles.secondary,
    ],
    "variant",
  );
export const SelectContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "select-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    materialStyles.blur,
    menuStyles.popup,
    selectStyles.positioner,
    selectStyles.popover,
    selectStyles.typography,
  ],
);
export const SelectList: StyledPart<typeof SdkList> = sdkPart(SdkList, "select-list", () => [
  menuStyles.content,
  selectStyles.list,
]);
export const SelectItem: StyledPart<typeof SdkItem> = sdkPart(SdkItem, "select-item", () => [
  menuItemStyles.root,
  selectStyles.item,
]);
export const SelectItemText: StyledPart<typeof SdkItemText> = sdkPart(
  SdkItemText,
  "select-item-text",
  () => selectStyles.itemText,
);
export const SelectLabel: StyledPart<typeof SdkLabel> = sdkPart(
  SdkLabel,
  "label",
  () => selectStyles.label,
);
export const SelectGroup: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "select-group",
  () => undefined,
);
export const SelectGroupLabel: StyledPart<typeof SdkGroupLabel> = sdkPart(
  SdkGroupLabel,
  "select-group-label",
  () => menuSectionStyles.label,
);
export const SelectSeparator: StyledPart<typeof SdkSeparator> = sdkPart(
  SdkSeparator,
  "select-separator",
  () => menuStyles.separator,
);
export const SelectArrow: StyledPart<typeof SdkArrow> = sdkPart(
  SdkArrow,
  "select-arrow",
  () => selectStyles.arrow,
);
export const SelectItems = (props: ComponentProps<typeof SdkItems>) =>
  createComponent(SdkItems, props);
export const SelectValue: StyledPart<typeof SdkValue> = sdkPart(
  SdkValue,
  "select-value",
  () => selectStyles.value,
);
export const SelectIndicator = htmlPart("span", "select-indicator", () => selectStyles.indicator);
export const SelectItemIndicator: StyledPart<typeof SdkItemIndicator> = sdkPart(
  SdkItemIndicator,
  "select-item-indicator",
  () => menuItemStyles.indicator,
);

export const Select: typeof SelectRoot & {
  Root: typeof SelectRoot;
  Trigger: typeof SelectTrigger;
  Content: typeof SelectContent;
  List: typeof SelectList;
  Item: typeof SelectItem;
  ItemText: typeof SelectItemText;
  Label: typeof SelectLabel;
  Group: typeof SelectGroup;
  GroupLabel: typeof SelectGroupLabel;
  Separator: typeof SelectSeparator;
  Arrow: typeof SelectArrow;
  Items: typeof SelectItems;
  Value: typeof SelectValue;
  Indicator: typeof SelectIndicator;
  ItemIndicator: typeof SelectItemIndicator;
} = Object.assign(SelectRoot, {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Content: SelectContent,
  List: SelectList,
  Item: SelectItem,
  ItemText: SelectItemText,
  Label: SelectLabel,
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
  Separator: SelectSeparator,
  Arrow: SelectArrow,
  Items: SelectItems,
  Value: SelectValue,
  Indicator: SelectIndicator,
  ItemIndicator: SelectItemIndicator,
});
