import SearchFieldGroup from "./search-field-group.svelte";
export { SearchFieldGroup };
import SearchFieldRoot from "./search-field-root.svelte";
import SearchFieldInput from "./search-field-input.svelte";
import SearchFieldIcon from "./search-field-icon.svelte";
import SearchFieldClear from "./search-field-clear.svelte";

export { SearchFieldRoot, SearchFieldInput, SearchFieldIcon, SearchFieldClear };
export const SearchField: typeof SearchFieldRoot & {
  SearchIcon: typeof SearchFieldIcon;
  ClearButton: typeof SearchFieldClear;
  Group: typeof SearchFieldGroup;
  Root: typeof SearchFieldRoot;
  Input: typeof SearchFieldInput;
  Icon: typeof SearchFieldIcon;
  Clear: typeof SearchFieldClear;
} = Object.assign(SearchFieldRoot, {
  SearchIcon: SearchFieldIcon,
  ClearButton: SearchFieldClear,
  Group: SearchFieldGroup,
  Root: SearchFieldRoot,
  Input: SearchFieldInput,
  Icon: SearchFieldIcon,
  Clear: SearchFieldClear,
});

export const SearchFieldClearButton: typeof SearchField.ClearButton = SearchField.ClearButton;

export const SearchFieldSearchIcon: typeof SearchField.SearchIcon = SearchField.SearchIcon;
