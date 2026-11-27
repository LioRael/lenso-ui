import { ComboboxStatus } from "@ui-sdk/svelte/combobox";
import ComboBoxRoot from "./root.svelte";
import { ComboboxItems as ComboBoxItems } from "@ui-sdk/svelte/combobox";
import { ComboboxValue as ComboBoxValue } from "@ui-sdk/svelte/combobox";
import ComboBoxTrigger from "./combo-box-trigger.svelte";
import ComboBoxContent from "./combo-box-content.svelte";
import ComboBoxList from "./combo-box-list.svelte";
import ComboBoxItem from "./combo-box-item.svelte";
import ComboBoxItemText from "./combo-box-item-text.svelte";
import ComboBoxLabel from "./combo-box-label.svelte";
import ComboBoxGroup from "./combo-box-group.svelte";
import ComboBoxGroupLabel from "./combo-box-group-label.svelte";
import ComboBoxSeparator from "./combo-box-separator.svelte";
import ComboBoxArrow from "./combo-box-arrow.svelte";
import ComboBoxInput from "./combo-box-input.svelte";
import ComboBoxInputGroup from "./combo-box-input-group.svelte";
import ComboBoxItemIndicator from "./combo-box-item-indicator.svelte";
import ComboBoxIndicator from "./combo-box-indicator.svelte";
import ComboBoxChips from "./combo-box-chips.svelte";
import ComboBoxChip from "./combo-box-chip.svelte";
import ComboBoxChipRemove from "./combo-box-chip-remove.svelte";
import ComboBoxEmpty from "./combo-box-empty.svelte";
import ComboBoxClearButton from "./combo-box-clear-button.svelte";

export {
  ComboBoxTrigger,
  ComboBoxContent,
  ComboBoxList,
  ComboBoxItem,
  ComboBoxItemText,
  ComboBoxLabel,
  ComboBoxGroup,
  ComboBoxGroupLabel,
  ComboBoxSeparator,
  ComboBoxArrow,
  ComboBoxInput,
  ComboBoxInputGroup,
  ComboBoxItemIndicator,
  ComboBoxIndicator,
  ComboBoxChips,
  ComboBoxChip,
  ComboBoxChipRemove,
  ComboBoxEmpty,
  ComboBoxClearButton,
  ComboBoxRoot,
  ComboBoxItems,
  ComboBoxValue,
};
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
