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

export const TimeField: typeof TimeFieldRoot & {
  Root: typeof TimeFieldRoot;
  Segment: typeof TimeFieldSegment;
  Label: typeof TimeFieldLabel;
  Description: typeof TimeFieldDescription;
  Error: typeof TimeFieldError;
} = Object.assign(TimeFieldRoot, {
  Root: TimeFieldRoot,
  Segment: TimeFieldSegment,
  Label: TimeFieldLabel,
  Description: TimeFieldDescription,
  Error: TimeFieldError,
});
