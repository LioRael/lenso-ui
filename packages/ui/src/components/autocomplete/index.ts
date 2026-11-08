import {
  AutocompleteRoot,
  AutocompleteInputGroup,
  AutocompleteInput,
  AutocompleteValue,
  AutocompleteTrigger,
  AutocompleteIndicator,
  AutocompletePortal,
  AutocompletePositioner,
  AutocompletePopover,
  AutocompleteList,
  AutocompleteItem,
  AutocompleteItemIndicator,
  AutocompleteLabel,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteSeparator,
  AutocompleteArrow,
  AutocompleteEmpty,
  AutocompleteClearButton,
  AutocompleteChips,
  AutocompleteChip,
  AutocompleteChipRemove,
  AutocompleteCollection,
  AutocompleteRow,
  AutocompleteStatus,
  AutocompleteBackdrop,
  useAutocompleteFilter,
} from "./autocomplete.js";
export const Autocomplete: typeof AutocompleteRoot & {
  Root: typeof AutocompleteRoot;
  InputGroup: typeof AutocompleteInputGroup;
  Input: typeof AutocompleteInput;
  Value: typeof AutocompleteValue;
  Trigger: typeof AutocompleteTrigger;
  Indicator: typeof AutocompleteIndicator;
  Icon: typeof AutocompleteIndicator;
  Portal: typeof AutocompletePortal;
  Positioner: typeof AutocompletePositioner;
  Popover: typeof AutocompletePopover;
  Popup: typeof AutocompletePopover;
  List: typeof AutocompleteList;
  Item: typeof AutocompleteItem;
  ItemIndicator: typeof AutocompleteItemIndicator;
  Label: typeof AutocompleteLabel;
  Group: typeof AutocompleteGroup;
  GroupLabel: typeof AutocompleteGroupLabel;
  Separator: typeof AutocompleteSeparator;
  Arrow: typeof AutocompleteArrow;
  Empty: typeof AutocompleteEmpty;
  Clear: typeof AutocompleteClearButton;
  ClearButton: typeof AutocompleteClearButton;
  Chips: typeof AutocompleteChips;
  Chip: typeof AutocompleteChip;
  ChipRemove: typeof AutocompleteChipRemove;
  Collection: typeof AutocompleteCollection;
  Row: typeof AutocompleteRow;
  Status: typeof AutocompleteStatus;
  Backdrop: typeof AutocompleteBackdrop;
  useFilter: typeof useAutocompleteFilter;
} = Object.assign(AutocompleteRoot, {
  Root: AutocompleteRoot,
  InputGroup: AutocompleteInputGroup,
  Input: AutocompleteInput,
  Value: AutocompleteValue,
  Trigger: AutocompleteTrigger,
  Indicator: AutocompleteIndicator,
  Icon: AutocompleteIndicator,
  Portal: AutocompletePortal,
  Positioner: AutocompletePositioner,
  Popover: AutocompletePopover,
  Popup: AutocompletePopover,
  List: AutocompleteList,
  Item: AutocompleteItem,
  ItemIndicator: AutocompleteItemIndicator,
  Label: AutocompleteLabel,
  Group: AutocompleteGroup,
  GroupLabel: AutocompleteGroupLabel,
  Separator: AutocompleteSeparator,
  Arrow: AutocompleteArrow,
  Empty: AutocompleteEmpty,
  Clear: AutocompleteClearButton,
  ClearButton: AutocompleteClearButton,
  Chips: AutocompleteChips,
  Chip: AutocompleteChip,
  ChipRemove: AutocompleteChipRemove,
  Collection: AutocompleteCollection,
  Row: AutocompleteRow,
  Status: AutocompleteStatus,
  Backdrop: AutocompleteBackdrop,
  useFilter: useAutocompleteFilter,
});
export * from "./autocomplete.js";
