import DatePickerClose from "./date-picker-close.svelte";
export { DatePickerClose };
import DatePickerPopoverDescription from "./date-picker-popover-description.svelte";
export { DatePickerPopoverDescription };
import DatePickerTitle from "./date-picker-title.svelte";
export { DatePickerTitle };
import {
  DateFieldSegment as DatePickerSegment,
  DateFieldLabel,
  DateFieldError,
  DateFieldDescription,
} from "../date-field/index.js";
import { DateInputGroup } from "../date-input-group/index.js";
import DatePickerRoot from "./date-picker-root.svelte";
import DatePickerInput from "./date-picker-input.svelte";
import DatePickerTrigger from "./date-picker-trigger.svelte";
import DatePickerIndicator from "./date-picker-indicator.svelte";
import DatePickerContent from "./date-picker-content.svelte";
import DatePickerHint from "./date-picker-hint.svelte";
import DatePickerClear from "./date-picker-clear.svelte";
import DatePickerPreset from "./date-picker-preset.svelte";

export { createDatePickerController } from "@ui-sdk/svelte/date-picker";
export {
  DatePickerRoot,
  DatePickerInput,
  DatePickerTrigger,
  DatePickerIndicator,
  DatePickerContent,
  DatePickerHint,
  DatePickerClear,
  DatePickerPreset,
};
export { DatePickerSegment };
export const DatePicker: typeof DatePickerRoot & {
  Segment: typeof DatePickerSegment;
  TriggerIndicator: typeof DatePickerIndicator;
  Popover: typeof DatePickerContent;
  Group: typeof DateInputGroup.Root;
  InputContainer: typeof DateInputGroup.InputContainer;
  Prefix: typeof DateInputGroup.Prefix;
  Suffix: typeof DateInputGroup.Suffix;
  Label: typeof DateFieldLabel;
  Error: typeof DateFieldError;
  Description: typeof DateFieldDescription;
  Title: typeof DatePickerTitle;
  PopoverDescription: typeof DatePickerPopoverDescription;
  Close: typeof DatePickerClose;
  Root: typeof DatePickerRoot;
  Input: typeof DatePickerInput;
  Trigger: typeof DatePickerTrigger;
  Indicator: typeof DatePickerIndicator;
  Content: typeof DatePickerContent;
  Hint: typeof DatePickerHint;
  Clear: typeof DatePickerClear;
  Preset: typeof DatePickerPreset;
} = Object.assign(DatePickerRoot, {
  Segment: DatePickerSegment,
  TriggerIndicator: DatePickerIndicator,
  Popover: DatePickerContent,
  Group: DateInputGroup.Root,
  InputContainer: DateInputGroup.InputContainer,
  Prefix: DateInputGroup.Prefix,
  Suffix: DateInputGroup.Suffix,
  Label: DateFieldLabel,
  Error: DateFieldError,
  Description: DateFieldDescription,
  Title: DatePickerTitle,
  PopoverDescription: DatePickerPopoverDescription,
  Close: DatePickerClose,
  Root: DatePickerRoot,
  Input: DatePickerInput,
  Trigger: DatePickerTrigger,
  Indicator: DatePickerIndicator,
  Content: DatePickerContent,
  Hint: DatePickerHint,
  Clear: DatePickerClear,
  Preset: DatePickerPreset,
});

export const DatePickerDescription: typeof DatePicker.Description = DatePicker.Description;

export const DatePickerError: typeof DatePicker.Error = DatePicker.Error;

export const DatePickerLabel: typeof DatePicker.Label = DatePicker.Label;

export const DatePickerPopover: typeof DatePicker.Popover = DatePicker.Popover;

export const DatePickerTriggerIndicator: typeof DatePicker.TriggerIndicator =
  DatePicker.TriggerIndicator;
