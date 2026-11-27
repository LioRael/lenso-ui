import AutocompleteInputGroup from "./autocomplete-input-group.svelte";
export { AutocompleteInputGroup };
import { AutocompleteStatus } from "@ui-sdk/svelte/autocomplete";
import { AutocompleteItems } from "@ui-sdk/svelte/autocomplete";
import AutocompleteTrigger from "./autocomplete-trigger.svelte";
import AutocompleteContent from "./autocomplete-content.svelte";
import AutocompleteList from "./autocomplete-list.svelte";
import AutocompleteItem from "./autocomplete-item.svelte";
import AutocompleteItemText from "./autocomplete-item-text.svelte";
import AutocompleteLabel from "./autocomplete-label.svelte";
import AutocompleteGroup from "./autocomplete-group.svelte";
import AutocompleteGroupLabel from "./autocomplete-group-label.svelte";
import AutocompleteSeparator from "./autocomplete-separator.svelte";
import AutocompleteArrow from "./autocomplete-arrow.svelte";
import AutocompleteInput from "./autocomplete-input.svelte";
import AutocompleteItemIcon from "./autocomplete-item-icon.svelte";
import AutocompleteEmpty from "./autocomplete-empty.svelte";
import AutocompleteClearButton from "./autocomplete-clear-button.svelte";
import AutocompleteIndicator from "./autocomplete-indicator.svelte";
import AutocompleteRoot from "./autocomplete-root.svelte";

export {
  AutocompleteTrigger,
  AutocompleteContent,
  AutocompleteList,
  AutocompleteItem,
  AutocompleteItemText,
  AutocompleteLabel,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteSeparator,
  AutocompleteArrow,
  AutocompleteInput,
  AutocompleteItemIcon,
  AutocompleteEmpty,
  AutocompleteClearButton,
  AutocompleteIndicator,
  AutocompleteRoot,
  AutocompleteItems,
};
export const Autocomplete: typeof AutocompleteRoot & {
  Clear: typeof AutocompleteClearButton;
  Status: typeof AutocompleteStatus;
  InputGroup: typeof AutocompleteInputGroup;
  Root: typeof AutocompleteRoot;
  Trigger: typeof AutocompleteTrigger;
  Content: typeof AutocompleteContent;
  List: typeof AutocompleteList;
  Item: typeof AutocompleteItem;
  ItemText: typeof AutocompleteItemText;
  Label: typeof AutocompleteLabel;
  Group: typeof AutocompleteGroup;
  GroupLabel: typeof AutocompleteGroupLabel;
  Separator: typeof AutocompleteSeparator;
  Arrow: typeof AutocompleteArrow;
  Items: typeof AutocompleteItems;
  Input: typeof AutocompleteInput;
  ItemIcon: typeof AutocompleteItemIcon;
  Empty: typeof AutocompleteEmpty;
  ClearButton: typeof AutocompleteClearButton;
  Indicator: typeof AutocompleteIndicator;
} = Object.assign(AutocompleteRoot, {
  Clear: AutocompleteClearButton,
  Status: AutocompleteStatus,
  InputGroup: AutocompleteInputGroup,
  Root: AutocompleteRoot,
  Trigger: AutocompleteTrigger,
  Content: AutocompleteContent,
  List: AutocompleteList,
  Item: AutocompleteItem,
  ItemText: AutocompleteItemText,
  Label: AutocompleteLabel,
  Group: AutocompleteGroup,
  GroupLabel: AutocompleteGroupLabel,
  Separator: AutocompleteSeparator,
  Arrow: AutocompleteArrow,
  Items: AutocompleteItems,
  Input: AutocompleteInput,
  ItemIcon: AutocompleteItemIcon,
  Empty: AutocompleteEmpty,
  ClearButton: AutocompleteClearButton,
  Indicator: AutocompleteIndicator,
});

export { AutocompleteStatus };
