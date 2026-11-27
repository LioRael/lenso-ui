import { ComboboxStatus } from "@ui-sdk/solid/combobox";
import { comboBoxStyles } from "@lenso/tokens/combo-box";
import { selectStyles } from "@lenso/tokens/select";
import { menuStyles, menuItemStyles, menuSectionStyles } from "@lenso/tokens/menu";
import { materialStyles } from "@lenso/tokens/materials";
import {
  Combobox as SdkRoot,
  ComboboxTrigger as SdkTrigger,
  ComboboxContent as SdkContent,
  ComboboxList as SdkList,
  ComboboxItem as SdkItem,
  ComboboxItemText as SdkItemText,
  ComboboxLabel as SdkLabel,
  ComboboxGroup as SdkGroup,
  ComboboxGroupLabel as SdkGroupLabel,
  ComboboxSeparator as SdkSeparator,
  ComboboxArrow as SdkArrow,
  ComboboxItems as SdkItems,
  ComboboxInput as SdkInput,
  ComboboxItemIndicator as SdkItemIndicator,
  ComboboxValue as SdkValue,
  ComboboxChips as SdkChips,
  ComboboxChip as SdkChip,
  ComboboxChipRemove as SdkChipRemove,
  ComboboxEmpty as SdkEmpty,
  ComboboxClear as SdkClearButton,
} from "@ui-sdk/solid/combobox";
import { createComponent, type ComponentProps } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export function ComboBoxRoot<T = string, Multiple extends boolean | undefined = false>(
  props: Parameters<typeof SdkRoot<T, Multiple>>[0],
) {
  return createComponent(SdkRoot<T, Multiple>, props);
}
export const ComboBoxTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "combo-box-trigger",
  () => comboBoxStyles.trigger,
);
export const ComboBoxContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "combo-box-content",
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
export const ComboBoxList: StyledPart<typeof SdkList> = sdkPart(SdkList, "combo-box-list", () => [
  menuStyles.content,
  selectStyles.list,
]);
export const ComboBoxItem: StyledPart<typeof SdkItem> = sdkPart(SdkItem, "combo-box-item", () => [
  menuItemStyles.root,
  selectStyles.item,
]);
export const ComboBoxItemText: StyledPart<typeof SdkItemText> = sdkPart(
  SdkItemText,
  "combo-box-item-text",
  () => selectStyles.itemText,
);
export const ComboBoxLabel: StyledPart<typeof SdkLabel> = sdkPart(
  SdkLabel,
  "label",
  () => selectStyles.label,
);
export const ComboBoxGroup: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "combo-box-group",
  () => undefined,
);
export const ComboBoxGroupLabel: StyledPart<typeof SdkGroupLabel> = sdkPart(
  SdkGroupLabel,
  "combo-box-group-label",
  () => menuSectionStyles.label,
);
export const ComboBoxSeparator: StyledPart<typeof SdkSeparator> = sdkPart(
  SdkSeparator,
  "combo-box-separator",
  () => menuStyles.separator,
);
export const ComboBoxArrow: StyledPart<typeof SdkArrow> = sdkPart(
  SdkArrow,
  "combo-box-arrow",
  () => selectStyles.arrow,
);
export const ComboBoxItems = (props: ComponentProps<typeof SdkItems>) =>
  createComponent(SdkItems, props);
export const ComboBoxInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "combo-box-input",
  () => [comboBoxStyles.input, comboBoxStyles.field],
);
export const ComboBoxInputGroup = htmlPart("div", "combo-box-input-group", () => [
  comboBoxStyles.inputGroup,
  comboBoxStyles.field,
]);
export const ComboBoxItemIndicator: StyledPart<typeof SdkItemIndicator> = sdkPart(
  SdkItemIndicator,
  "combo-box-item-indicator",
  () => menuItemStyles.indicator,
);
export const ComboBoxIndicator = htmlPart("span", "combo-box-indicator", () => comboBoxStyles.icon);
export const ComboBoxValue: StyledPart<typeof SdkValue> = sdkPart(
  SdkValue,
  "combo-box-value",
  () => comboBoxStyles.value,
);
export const ComboBoxChips: StyledPart<typeof SdkChips> = sdkPart(
  SdkChips,
  "combo-box-chips",
  () => comboBoxStyles.chips,
);
export const ComboBoxChip: StyledPart<typeof SdkChip> = sdkPart(
  SdkChip,
  "combo-box-chip",
  () => comboBoxStyles.chip,
);
export const ComboBoxChipRemove: StyledPart<typeof SdkChipRemove> = sdkPart(
  SdkChipRemove,
  "combo-box-chip-remove",
  () => comboBoxStyles.chipRemove,
);
export const ComboBoxEmpty: StyledPart<typeof SdkEmpty> = sdkPart(
  SdkEmpty,
  "combo-box-empty",
  () => comboBoxStyles.empty,
);
export const ComboBoxClearButton: StyledPart<typeof SdkClearButton> = sdkPart(
  SdkClearButton,
  "combo-box-clear-button",
  () => comboBoxStyles.clear,
);

export const ComboBox: typeof ComboBoxRoot & {
  Clear: typeof ComboBoxClearButton;
  Status: typeof ComboboxStatus;
  Root: typeof ComboBoxRoot;
  Trigger: typeof ComboBoxTrigger;
  Content: typeof ComboBoxContent;
  List: typeof ComboBoxList;
  Item: typeof ComboBoxItem;
  ItemText: typeof ComboBoxItemText;
  Label: typeof ComboBoxLabel;
  Group: typeof ComboBoxGroup;
  GroupLabel: typeof ComboBoxGroupLabel;
  Separator: typeof ComboBoxSeparator;
  Arrow: typeof ComboBoxArrow;
  Items: typeof ComboBoxItems;
  Input: typeof ComboBoxInput;
  InputGroup: typeof ComboBoxInputGroup;
  ItemIndicator: typeof ComboBoxItemIndicator;
  Indicator: typeof ComboBoxIndicator;
  Value: typeof ComboBoxValue;
  Chips: typeof ComboBoxChips;
  Chip: typeof ComboBoxChip;
  ChipRemove: typeof ComboBoxChipRemove;
  Empty: typeof ComboBoxEmpty;
  ClearButton: typeof ComboBoxClearButton;
} = Object.assign(ComboBoxRoot, {
  Clear: ComboBoxClearButton,
  Status: ComboboxStatus,
  Root: ComboBoxRoot,
  Trigger: ComboBoxTrigger,
  Content: ComboBoxContent,
  List: ComboBoxList,
  Item: ComboBoxItem,
  ItemText: ComboBoxItemText,
  Label: ComboBoxLabel,
  Group: ComboBoxGroup,
  GroupLabel: ComboBoxGroupLabel,
  Separator: ComboBoxSeparator,
  Arrow: ComboBoxArrow,
  Items: ComboBoxItems,
  Input: ComboBoxInput,
  InputGroup: ComboBoxInputGroup,
  ItemIndicator: ComboBoxItemIndicator,
  Indicator: ComboBoxIndicator,
  Value: ComboBoxValue,
  Chips: ComboBoxChips,
  Chip: ComboBoxChip,
  ChipRemove: ComboBoxChipRemove,
  Empty: ComboBoxEmpty,
  ClearButton: ComboBoxClearButton,
});

export const ComboBoxStatus: typeof ComboBox.Status = ComboBox.Status;
