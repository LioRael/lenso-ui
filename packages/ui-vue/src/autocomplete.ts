import { AutocompleteStatus } from "@ui-sdk/vue/autocomplete";
import { autocompleteStyles, autocompleteFieldStyles } from "@lenso/tokens/autocomplete";
import { selectStyles } from "@lenso/tokens/select";
import { menuStyles, menuItemStyles, menuSectionStyles } from "@lenso/tokens/menu";
import { materialStyles } from "@lenso/tokens/materials";
import {
  Autocomplete as SdkRoot,
  AutocompleteTrigger as SdkTrigger,
  AutocompleteContent as SdkContent,
  AutocompleteList as SdkList,
  AutocompleteItem as SdkItem,
  AutocompleteItemText as SdkItemText,
  AutocompleteLabel as SdkLabel,
  AutocompleteGroup as SdkGroup,
  AutocompleteGroupLabel as SdkGroupLabel,
  AutocompleteSeparator as SdkSeparator,
  AutocompleteArrow as SdkArrow,
  AutocompleteItems as SdkItems,
  AutocompleteInput as SdkInput,
  AutocompleteItemIcon as SdkItemIcon,
  AutocompleteEmpty as SdkEmpty,
  AutocompleteClear as SdkClearButton,
} from "@ui-sdk/vue/autocomplete";
import { forwardPart, htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const AutocompleteRoot: typeof SdkRoot = forwardPart(SdkRoot);
export const AutocompleteTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "autocomplete-trigger",
  () => selectStyles.trigger,
);
export const AutocompleteContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "autocomplete-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    materialStyles.blur,
    selectStyles.positioner,
    autocompleteStyles.popover,
    selectStyles.typography,
  ],
);
export const AutocompleteList: StyledPart<typeof SdkList> = sdkPart(
  SdkList,
  "autocomplete-list",
  () => [menuStyles.content, selectStyles.list],
);
export const AutocompleteItem: StyledPart<typeof SdkItem> = sdkPart(
  SdkItem,
  "autocomplete-item",
  () => [menuItemStyles.root, selectStyles.item],
);
export const AutocompleteItemText: StyledPart<typeof SdkItemText> = sdkPart(
  SdkItemText,
  "autocomplete-item-text",
  () => selectStyles.itemText,
);
export const AutocompleteLabel: StyledPart<typeof SdkLabel> = sdkPart(
  SdkLabel,
  "label",
  () => selectStyles.label,
);
export const AutocompleteGroup: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "autocomplete-group",
  () => undefined,
);
export const AutocompleteGroupLabel: StyledPart<typeof SdkGroupLabel> = sdkPart(
  SdkGroupLabel,
  "autocomplete-group-label",
  () => menuSectionStyles.label,
);
export const AutocompleteSeparator: StyledPart<typeof SdkSeparator> = sdkPart(
  SdkSeparator,
  "autocomplete-separator",
  () => menuStyles.separator,
);
export const AutocompleteArrow: StyledPart<typeof SdkArrow> = sdkPart(
  SdkArrow,
  "autocomplete-arrow",
  () => selectStyles.arrow,
);
export const AutocompleteItems: typeof SdkItems = forwardPart(SdkItems);
export const AutocompleteInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "autocomplete-input",
  () => autocompleteStyles.input,
);
export const AutocompleteItemIcon: StyledPart<typeof SdkItemIcon> = sdkPart(
  SdkItemIcon,
  "autocomplete-item-icon",
  () => menuItemStyles.icon,
);
export const AutocompleteEmpty: StyledPart<typeof SdkEmpty> = sdkPart(
  SdkEmpty,
  "autocomplete-empty",
  () => autocompleteFieldStyles.empty,
);
export const AutocompleteClearButton: StyledPart<typeof SdkClearButton> = sdkPart(
  SdkClearButton,
  "autocomplete-clear-button",
  () => autocompleteFieldStyles.clear,
);
export const AutocompleteIndicator = htmlPart(
  "span",
  "autocomplete-indicator",
  () => selectStyles.indicator,
);

export const AutocompleteInputGroup = htmlPart(
  "div",
  "autocomplete-input-group",
  () => autocompleteFieldStyles.inputGroup,
);
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
