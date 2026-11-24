import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
import { DateInput as SdkInput, DateInputSegment as SdkSegment } from "@ui-sdk/solid/date-input";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const DateInputGroupRoot = htmlPart<
  "div",
  { variant?: "primary" | "secondary"; fullWidth?: boolean }
>(
  "div",
  "date-input-group",
  (props) => [
    dateInputGroupStyles.root,
    props.variant === "secondary" && dateInputGroupStyles.secondary,
    props.fullWidth && dateInputGroupStyles.fullWidth,
  ],
  "variant",
  "fullWidth",
);
export const DateInputGroupInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "date-input-group-input",
  () => dateInputGroupStyles.input,
);
export const DateInputGroupSegment: StyledPart<typeof SdkSegment> = sdkPart(
  SdkSegment,
  "date-input-group-segment",
  () => [dateInputGroupStyles.segment, dateInputGroupStyles.segmentInput],
);
export const DateInputGroupPrefix = htmlPart(
  "span",
  "date-input-group-prefix",
  () => dateInputGroupStyles.prefix,
);
export const DateInputGroupSuffix = htmlPart(
  "span",
  "date-input-group-suffix",
  () => dateInputGroupStyles.suffix,
);

export const DateInputGroup: typeof DateInputGroupRoot & {
  Root: typeof DateInputGroupRoot;
  Input: typeof DateInputGroupInput;
  Segment: typeof DateInputGroupSegment;
  Prefix: typeof DateInputGroupPrefix;
  Suffix: typeof DateInputGroupSuffix;
} = Object.assign(DateInputGroupRoot, {
  Root: DateInputGroupRoot,
  Input: DateInputGroupInput,
  Segment: DateInputGroupSegment,
  Prefix: DateInputGroupPrefix,
  Suffix: DateInputGroupSuffix,
});
