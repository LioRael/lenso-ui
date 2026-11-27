import { colorInputGroupStyles } from "@lenso/tokens/color-input-group";
import { inputStyles } from "@lenso/tokens/input";
import {
  ColorPickerInput as SdkInput,
  ColorPickerChannelInput as SdkChannelInput,
} from "@ui-sdk/solid/color-picker";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const ColorInputGroupRoot = htmlPart(
  "div",
  "color-input-group",
  () => colorInputGroupStyles.root,
);
export const ColorInputGroupInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "color-input-group-input",
  () => inputStyles.input,
);
export const ColorInputGroupChannelInput: StyledPart<typeof SdkChannelInput> = sdkPart(
  SdkChannelInput,
  "color-input-group-channel-input",
  () => inputStyles.input,
);

export const ColorInputGroupPrefix = htmlPart(
  "div",
  "color-input-group-prefix",
  () => colorInputGroupStyles.prefix,
);
export const ColorInputGroupSuffix = htmlPart(
  "div",
  "color-input-group-suffix",
  () => colorInputGroupStyles.suffix,
);
export const ColorInputGroup: typeof ColorInputGroupRoot & {
  Prefix: typeof ColorInputGroupPrefix;
  Suffix: typeof ColorInputGroupSuffix;
  Root: typeof ColorInputGroupRoot;
  Input: typeof ColorInputGroupInput;
  ChannelInput: typeof ColorInputGroupChannelInput;
} = Object.assign(ColorInputGroupRoot, {
  Prefix: ColorInputGroupPrefix,
  Suffix: ColorInputGroupSuffix,
  Root: ColorInputGroupRoot,
  Input: ColorInputGroupInput,
  ChannelInput: ColorInputGroupChannelInput,
});
