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

export const ColorInputGroup: typeof ColorInputGroupRoot & {
  Root: typeof ColorInputGroupRoot;
  Input: typeof ColorInputGroupInput;
  ChannelInput: typeof ColorInputGroupChannelInput;
} = Object.assign(ColorInputGroupRoot, {
  Root: ColorInputGroupRoot,
  Input: ColorInputGroupInput,
  ChannelInput: ColorInputGroupChannelInput,
});
