import { searchFieldStyles, searchFieldGroupStyles } from "@lenso/tokens/search-field";
import { inputStyles } from "@lenso/tokens/input";
import {
  InputGroup as SdkRoot,
  Input as SdkInput,
  InputClear as SdkClear,
} from "@ui-sdk/solid/input";
import { IconSearch } from "./icons.jsx";
import { merge, createComponent, type ComponentProps } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const SearchFieldRoot: StyledPart<
  typeof SdkRoot,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
> = sdkPart<
  ComponentProps<typeof SdkRoot>,
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
>(
  SdkRoot,
  "search-field",
  (props) => [
    searchFieldGroupStyles.root,
    props.variant === "secondary" && searchFieldGroupStyles.secondary,
    props.fullWidth && searchFieldGroupStyles.fullWidth,
  ],
  "variant",
  "fullWidth",
);
export const SearchFieldInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "search-field-input",
  () => [inputStyles.input, searchFieldGroupStyles.input],
);
const Icon = htmlPart("span", "search-field-icon", () => searchFieldStyles.icon);
export function SearchFieldIcon(props: ComponentProps<typeof Icon>) {
  return createComponent(
    Icon,
    merge(props, {
      get children() {
        return props.children ?? createComponent(IconSearch, {});
      },
    }),
  );
}
export const SearchFieldClear: StyledPart<typeof SdkClear> = sdkPart(
  SdkClear,
  "search-field-clear",
  () => searchFieldStyles.clear,
);

export const SearchFieldGroup = htmlPart(
  "div",
  "search-field-group",
  () => searchFieldGroupStyles.root,
);
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
