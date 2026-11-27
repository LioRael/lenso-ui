import SelectRoot from "./root.svelte";
import { SelectItems } from "@ui-sdk/svelte/select";
import SelectTrigger from "./select-trigger.svelte";
import SelectContent from "./select-content.svelte";
import SelectList from "./select-list.svelte";
import SelectItem from "./select-item.svelte";
import SelectItemText from "./select-item-text.svelte";
import SelectLabel from "./select-label.svelte";
import SelectGroup from "./select-group.svelte";
import SelectGroupLabel from "./select-group-label.svelte";
import SelectSeparator from "./select-separator.svelte";
import SelectArrow from "./select-arrow.svelte";
import SelectValue from "./select-value.svelte";
import SelectIndicator from "./select-indicator.svelte";
import SelectItemIndicator from "./select-item-indicator.svelte";

export {
  SelectTrigger,
  SelectContent,
  SelectList,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectGroup,
  SelectGroupLabel,
  SelectSeparator,
  SelectArrow,
  SelectValue,
  SelectIndicator,
  SelectItemIndicator,
  SelectRoot,
  SelectItems,
};
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
