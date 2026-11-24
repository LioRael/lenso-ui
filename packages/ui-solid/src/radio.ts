import { radioStyles } from "@lenso/tokens/radio";
import { Radio as SdkRoot, RadioIndicator as SdkIndicator } from "@ui-sdk/solid/radio";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const RadioRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "radio",
  () => radioStyles.root,
);
export const RadioContent = htmlPart("span", "radio-content", () => radioStyles.content);
export const RadioControl = htmlPart<"span", { variant?: "primary" | "secondary" }>(
  "span",
  "radio-control",
  (props) => [radioStyles.control, props.variant === "secondary" && radioStyles.secondary],
  "variant",
);
export const RadioIndicator: StyledPart<typeof SdkIndicator> = sdkPart(
  SdkIndicator,
  "radio-indicator",
  () => radioStyles.indicator,
);

export const Radio: typeof RadioRoot & {
  Root: typeof RadioRoot;
  Content: typeof RadioContent;
  Control: typeof RadioControl;
  Indicator: typeof RadioIndicator;
} = Object.assign(RadioRoot, {
  Root: RadioRoot,
  Content: RadioContent,
  Control: RadioControl,
  Indicator: RadioIndicator,
});
