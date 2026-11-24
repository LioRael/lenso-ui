import { colorFieldStyles } from "@lenso/tokens/color-field";
import { inputStyles } from "@lenso/tokens/input";
import {
  ColorPicker as SdkRoot,
  ColorPickerInput as SdkInput,
  ColorPickerChannelInput as SdkChannelInput,
} from "@ui-sdk/solid/color-picker";
import { sdkPart, type StyledPart } from "./parts.js";

export const ColorFieldRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "color-field",
  () => colorFieldStyles.root,
);
export const ColorFieldInput: StyledPart<typeof SdkInput> = sdkPart(
  SdkInput,
  "color-field-input",
  () => inputStyles.input,
);
export const ColorFieldChannelInput: StyledPart<typeof SdkChannelInput> = sdkPart(
  SdkChannelInput,
  "color-field-channel-input",
  () => inputStyles.input,
);

export const ColorField: typeof ColorFieldRoot & {
  Root: typeof ColorFieldRoot;
  Input: typeof ColorFieldInput;
  ChannelInput: typeof ColorFieldChannelInput;
} = Object.assign(ColorFieldRoot, {
  Root: ColorFieldRoot,
  Input: ColorFieldInput,
  ChannelInput: ColorFieldChannelInput,
});
