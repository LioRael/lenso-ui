import { DateInputGroup } from "./date-input-group.js";
import { timeFieldStyles } from "@lenso/tokens/time-field";
import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
import { TimeInput as SdkRoot, TimeInputSegment as SdkSegment } from "@ui-sdk/solid/time-input";
import { type ComponentProps } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const TimeFieldRoot: StyledPart<typeof SdkRoot, { fullWidth?: boolean }> = sdkPart<
  ComponentProps<typeof SdkRoot>,
  { fullWidth?: boolean }
>(
  SdkRoot,
  "time-field",
  (props) => [
    timeFieldStyles.root,
    dateInputGroupStyles.root,
    props.fullWidth && timeFieldStyles.fullWidth,
  ],
  "fullWidth",
);
export const TimeFieldSegment: StyledPart<typeof SdkSegment> = sdkPart(
  SdkSegment,
  "time-field-segment",
  () => [dateInputGroupStyles.segment, dateInputGroupStyles.segmentInput],
);
export const TimeFieldLabel = htmlPart("label", "label", () => timeFieldStyles.label);
export const TimeFieldDescription = htmlPart(
  "span",
  "time-field-description",
  () => timeFieldStyles.description,
);
export const TimeFieldError = htmlPart("div", "time-field-error", () => timeFieldStyles.error);

export const TimeFieldInput = htmlPart("div", "time-field-input", () => dateInputGroupStyles.input);
export const TimeField: typeof TimeFieldRoot & {
  Group: typeof DateInputGroup.Root;
  InputContainer: typeof DateInputGroup.InputContainer;
  Prefix: typeof DateInputGroup.Prefix;
  Suffix: typeof DateInputGroup.Suffix;
  Input: typeof TimeFieldInput;
  Root: typeof TimeFieldRoot;
  Segment: typeof TimeFieldSegment;
  Label: typeof TimeFieldLabel;
  Description: typeof TimeFieldDescription;
  Error: typeof TimeFieldError;
} = Object.assign(TimeFieldRoot, {
  Group: DateInputGroup.Root,
  InputContainer: DateInputGroup.InputContainer,
  Prefix: DateInputGroup.Prefix,
  Suffix: DateInputGroup.Suffix,
  Input: TimeFieldInput,
  Root: TimeFieldRoot,
  Segment: TimeFieldSegment,
  Label: TimeFieldLabel,
  Description: TimeFieldDescription,
  Error: TimeFieldError,
});

export {
  createTimeInputController as createTimeFieldController,
  type TimeInputController as TimeFieldController,
} from "@ui-sdk/core/time-input";
