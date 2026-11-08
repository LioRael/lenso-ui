import {
  ComboBoxRoot,
  ComboBoxInputGroup,
  ComboBoxInput,
  ComboBoxValue,
  ComboBoxTrigger,
  ComboBoxIndicator,
  ComboBoxPortal,
  ComboBoxPositioner,
  ComboBoxPopover,
  ComboBoxList,
  ComboBoxItem,
  ComboBoxItemIndicator,
  ComboBoxLabel,
  ComboBoxGroup,
  ComboBoxGroupLabel,
  ComboBoxSeparator,
  ComboBoxArrow,
  ComboBoxEmpty,
  ComboBoxClearButton,
  ComboBoxChips,
  ComboBoxChip,
  ComboBoxChipRemove,
  ComboBoxCollection,
  ComboBoxRow,
  ComboBoxStatus,
  ComboBoxBackdrop,
  useComboBoxFilter,
} from "./combo-box.js";
export const ComboBox: typeof ComboBoxRoot & {
  Root: typeof ComboBoxRoot;
  InputGroup: typeof ComboBoxInputGroup;
  Input: typeof ComboBoxInput;
  Value: typeof ComboBoxValue;
  Trigger: typeof ComboBoxTrigger;
  Indicator: typeof ComboBoxIndicator;
  Icon: typeof ComboBoxIndicator;
  Portal: typeof ComboBoxPortal;
  Positioner: typeof ComboBoxPositioner;
  Popover: typeof ComboBoxPopover;
  Popup: typeof ComboBoxPopover;
  List: typeof ComboBoxList;
  Item: typeof ComboBoxItem;
  ItemIndicator: typeof ComboBoxItemIndicator;
  Label: typeof ComboBoxLabel;
  Group: typeof ComboBoxGroup;
  GroupLabel: typeof ComboBoxGroupLabel;
  Separator: typeof ComboBoxSeparator;
  Arrow: typeof ComboBoxArrow;
  Empty: typeof ComboBoxEmpty;
  Clear: typeof ComboBoxClearButton;
  ClearButton: typeof ComboBoxClearButton;
  Chips: typeof ComboBoxChips;
  Chip: typeof ComboBoxChip;
  ChipRemove: typeof ComboBoxChipRemove;
  Collection: typeof ComboBoxCollection;
  Row: typeof ComboBoxRow;
  Status: typeof ComboBoxStatus;
  Backdrop: typeof ComboBoxBackdrop;
  useFilter: typeof useComboBoxFilter;
} = Object.assign(ComboBoxRoot, {
  Root: ComboBoxRoot,
  InputGroup: ComboBoxInputGroup,
  Input: ComboBoxInput,
  Value: ComboBoxValue,
  Trigger: ComboBoxTrigger,
  Indicator: ComboBoxIndicator,
  Icon: ComboBoxIndicator,
  Portal: ComboBoxPortal,
  Positioner: ComboBoxPositioner,
  Popover: ComboBoxPopover,
  Popup: ComboBoxPopover,
  List: ComboBoxList,
  Item: ComboBoxItem,
  ItemIndicator: ComboBoxItemIndicator,
  Label: ComboBoxLabel,
  Group: ComboBoxGroup,
  GroupLabel: ComboBoxGroupLabel,
  Separator: ComboBoxSeparator,
  Arrow: ComboBoxArrow,
  Empty: ComboBoxEmpty,
  Clear: ComboBoxClearButton,
  ClearButton: ComboBoxClearButton,
  Chips: ComboBoxChips,
  Chip: ComboBoxChip,
  ChipRemove: ComboBoxChipRemove,
  Collection: ComboBoxCollection,
  Row: ComboBoxRow,
  Status: ComboBoxStatus,
  Backdrop: ComboBoxBackdrop,
  useFilter: useComboBoxFilter,
});
export * from "./combo-box.js";
