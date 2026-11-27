import { popoverStyles } from "@lenso/tokens/popover";
import { defineComponent, h, inject, provide, type InjectionKey, type PropType } from "vue";
import type { ButtonActionDetails } from "@ui-sdk/vue/button";
import { Button } from "./button.js";
import { createDatePickerController, type DatePickerController } from "@ui-sdk/vue/date-picker";
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
} from "@ui-sdk/vue/date-picker";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

const BaseDatePicker: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "date-picker",
  () => datePickerStyles.root,
);
const Controller: InjectionKey<() => DatePickerController> = Symbol("DatePickerController");
export const DatePickerRoot: typeof BaseDatePicker = defineComponent({
  name: "LensoDatePicker",
  inheritAttrs: false,
  props: { controller: Object as PropType<DatePickerController> },
  setup(props, { attrs, slots }) {
    const own = createDatePickerController();
    const controller = () => props.controller ?? own;
    provide(Controller, controller);
    return () => h(BaseDatePicker, { ...attrs, controller: controller() }, slots);
  },
}) as unknown as typeof BaseDatePicker;

export const DatePickerClose: typeof Button.Root = defineComponent({
  name: "LensoDatePickerClose",
  inheritAttrs: false,
  props: {
    onClick: Function as PropType<(event: MouseEvent, details: ButtonActionDetails) => unknown>,
  },
  setup(props, { attrs, slots }) {
    const controller = inject(Controller, undefined);
    return () =>
      h(
        Button.Root,
        {
          "aria-label": "Close",
          ...attrs,
          onClick: (event: MouseEvent, details: ButtonActionDetails) => {
            const result = props.onClick?.(event, details);
            if (!event.defaultPrevented)
              controller?.().setOpen(false, { reason: "close-press", event });
            return result;
          },
        },
        slots,
      );
  },
}) as unknown as typeof Button.Root;

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

export { createDatePickerController, type DatePickerValue } from "@ui-sdk/vue/date-picker";

export const DatePickerTitle = htmlPart("h2", "date-picker-title", () => popoverStyles.title);
export const DatePickerPopoverDescription = htmlPart(
  "p",
  "date-picker-popover-description",
  () => popoverStyles.description,
);
export { DatePickerSegment };
export const datePickerParts: {
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
} = {
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
};

export const DatePicker: typeof DatePickerRoot & typeof datePickerParts = Object.assign(
  DatePickerRoot,
  datePickerParts,
);

export const DatePickerDescription: typeof DatePicker.Description = DatePicker.Description;

export const DatePickerError: typeof DatePicker.Error = DatePicker.Error;

export const DatePickerLabel: typeof DatePicker.Label = DatePicker.Label;

export const DatePickerPopover: typeof DatePicker.Popover = DatePicker.Popover;

export const DatePickerTriggerIndicator: typeof DatePicker.TriggerIndicator =
  DatePicker.TriggerIndicator;
