import { popoverStyles } from "@lenso/tokens/popover";
import { createContext, useContext, omit, type ComponentProps } from "solid-js";
import { Button } from "./button.jsx";
import { createDatePickerController, type DatePickerController } from "@ui-sdk/solid/date-picker";
import {
  DateFieldSegment as DatePickerSegment,
  DateFieldLabel,
  DateFieldError,
  DateFieldDescription,
} from "./date-field.js";
import { DateInputGroup } from "./date-input-group.js";
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

const BaseDatePicker: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "date-picker",
  () => datePickerStyles.root,
);
const Controller = createContext<() => DatePickerController>();
export function DatePickerRoot(props: ComponentProps<typeof BaseDatePicker>) {
  const own = createDatePickerController();
  const controller = () => props.controller ?? own;
  return (
    <Controller value={controller}>
      <BaseDatePicker {...props} controller={controller()} />
    </Controller>
  );
}
export function DatePickerClose(props: ComponentProps<typeof Button>) {
  const controller = useContext(Controller);
  return (
    <Button
      aria-label="Close"
      {...omit(props, "onClick")}
      onClick={(e, d) => {
        const cb = props.onClick;
        const result = typeof cb === "function" ? cb(e, d) : cb?.[0](cb[1], e, d);
        if (!e.defaultPrevented) controller().setOpen(false, { reason: "close-press", event: e });
        return result;
      }}
    />
  );
}
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
    materialStyles.blur,
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

export const DatePickerTitle = htmlPart("h2", "date-picker-title", () => popoverStyles.title);
export const DatePickerPopoverDescription = htmlPart(
  "p",
  "date-picker-popover-description",
  () => popoverStyles.description,
);
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
