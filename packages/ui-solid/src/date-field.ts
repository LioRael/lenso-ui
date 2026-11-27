import { DateInputGroup } from "./date-input-group.js";
import { dateFieldStyles } from "@lenso/tokens/date-field";
import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
import { DateInput as SdkRoot, DateInputSegment as SdkSegment } from "@ui-sdk/solid/date-input";
import { type ComponentProps } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const DateFieldRoot: StyledPart<typeof SdkRoot, { fullWidth?: boolean }> = sdkPart<
  ComponentProps<typeof SdkRoot>,
  { fullWidth?: boolean }
>(
  SdkRoot,
  "date-field",
  (props) => [
    dateFieldStyles.root,
    dateInputGroupStyles.root,
    props.fullWidth && dateFieldStyles.fullWidth,
  ],
  "fullWidth",
);
export const DateFieldSegment: StyledPart<typeof SdkSegment> = sdkPart(
  SdkSegment,
  "date-field-segment",
  () => [dateInputGroupStyles.segment, dateInputGroupStyles.segmentInput],
);
export const DateFieldLabel = htmlPart("label", "label", () => dateFieldStyles.label);
export const DateFieldDescription = htmlPart(
  "span",
  "date-field-description",
  () => dateFieldStyles.description,
);
export const DateFieldError = htmlPart("div", "date-field-error", () => dateFieldStyles.error);

export const DateFieldInput = htmlPart("div", "date-field-input", () => dateInputGroupStyles.input);
export const DateField: typeof DateFieldRoot & {
  Group: typeof DateInputGroup.Root;
  InputContainer: typeof DateInputGroup.InputContainer;
  Prefix: typeof DateInputGroup.Prefix;
  Suffix: typeof DateInputGroup.Suffix;
  Input: typeof DateFieldInput;
  Root: typeof DateFieldRoot;
  Segment: typeof DateFieldSegment;
  Label: typeof DateFieldLabel;
  Description: typeof DateFieldDescription;
  Error: typeof DateFieldError;
} = Object.assign(DateFieldRoot, {
  Group: DateInputGroup.Root,
  InputContainer: DateInputGroup.InputContainer,
  Prefix: DateInputGroup.Prefix,
  Suffix: DateInputGroup.Suffix,
  Input: DateFieldInput,
  Root: DateFieldRoot,
  Segment: DateFieldSegment,
  Label: DateFieldLabel,
  Description: DateFieldDescription,
  Error: DateFieldError,
});

export {
  createDateInputController as createDateFieldController,
  type DateInputController as DateFieldController,
} from "@ui-sdk/core/date-input";
