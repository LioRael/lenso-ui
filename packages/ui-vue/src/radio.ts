import { radioStyles } from "@lenso/tokens/radio";
import { radioGroupStyles } from "@lenso/tokens/radio-group";
import {
  Radio as SdkRoot,
  RadioGroup as SdkGroup,
  RadioIndicator as SdkIndicator,
} from "@ui-sdk/vue/radio";
import { createChoiceVariant, type ChoiceVariant } from "./choice-variant.js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

type Variant = { variant?: ChoiceVariant };
export const RadioVariantContext: import("vue").InjectionKey<() => ChoiceVariant> =
  Symbol("RadioVariant");
const withVariant = createChoiceVariant(RadioVariantContext);
export const RadioRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "radio",
  () => radioStyles.root,
);
export const RadioContent = htmlPart("span", "radio-content", () => radioStyles.content);
const Control = htmlPart<"span", Variant>(
  "span",
  "radio-control",
  (props) => [radioStyles.control, props.variant === "secondary" && radioStyles.secondary],
  "variant",
);
export const RadioControl: typeof Control = withVariant(
  Control,
  false,
) as unknown as typeof Control;
export const RadioIndicator: StyledPart<typeof SdkIndicator> = sdkPart(
  SdkIndicator,
  "radio-indicator",
  () => radioStyles.indicator,
);
const Group: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "radio-group",
  () => radioGroupStyles.root,
);
export const RadioGroupRoot: StyledPart<typeof SdkGroup, Variant> = withVariant(
  Group,
  true,
) as unknown as StyledPart<typeof SdkGroup, Variant>;
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

export type RadioVariant = ChoiceVariant;
