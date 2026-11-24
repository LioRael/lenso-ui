import { datePickerStyles } from "@lenso/tokens/date-picker";
import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
import { materialStyles } from "@lenso/tokens/materials";
import {
  DatePicker as SdkRoot,
  DatePickerInput as SdkInput,
  DatePickerTrigger as SdkTrigger,
  DatePickerContent as SdkContent,
  DatePickerHint as SdkHint,
  DatePickerClear as SdkClear,
  DatePickerPreset as SdkPreset,
} from "@ui-sdk/solid/date-picker";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const DatePickerRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "date-picker",
  () => datePickerStyles.root,
);
export const DatePickerInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "date-picker-input",
  () => [dateInputGroupStyles.root, dateInputGroupStyles.input],
);
export const DatePickerTrigger: StyledPart<typeof SdkTrigger> = sdkPart(
  SdkTrigger,
  "date-picker-trigger",
  () => datePickerStyles.trigger,
);
export const DatePickerIndicator = htmlPart(
  "span",
  "date-picker-indicator",
  () => datePickerStyles.indicator,
);
export const DatePickerContent: StyledPart<typeof SdkContent> = sdkPart(
  SdkContent,
  "date-picker-content",
  () => [
    materialStyles.root,
    materialStyles.accessible,
    materialStyles.anchored,
    datePickerStyles.popover,
    datePickerStyles.scroller,
  ],
);
export const DatePickerHint: StyledPart<typeof SdkHint> = sdkPart(
  SdkHint,
  "date-picker-hint",
  () => datePickerStyles.accessory,
);
export const DatePickerClear: StyledPart<typeof SdkClear> = sdkPart(
  SdkClear,
  "date-picker-clear",
  () => datePickerStyles.accessory,
);
export const DatePickerPreset: StyledPart<typeof SdkPreset> = sdkPart(
  SdkPreset,
  "date-picker-preset",
  () => datePickerStyles.accessory,
);

export { createDatePickerController } from "@ui-sdk/solid/date-picker";

export const DatePicker: typeof DatePickerRoot & {
  Root: typeof DatePickerRoot;
  Input: typeof DatePickerInput;
  Trigger: typeof DatePickerTrigger;
  Indicator: typeof DatePickerIndicator;
  Content: typeof DatePickerContent;
  Hint: typeof DatePickerHint;
  Clear: typeof DatePickerClear;
  Preset: typeof DatePickerPreset;
} = Object.assign(DatePickerRoot, {
  Root: DatePickerRoot,
  Input: DatePickerInput,
  Trigger: DatePickerTrigger,
  Indicator: DatePickerIndicator,
  Content: DatePickerContent,
  Hint: DatePickerHint,
  Clear: DatePickerClear,
  Preset: DatePickerPreset,
});
