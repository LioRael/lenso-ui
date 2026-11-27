import { ColorInputGroup } from "./color-input-group.js";
import { colorFieldStyles } from "@lenso/tokens/color-field";
import { inputStyles } from "@lenso/tokens/input";
import {
  ColorPicker as SdkRoot,
  ColorPickerInput as SdkInput,
  ColorPickerChannelInput as SdkChannelInput,
} from "@ui-sdk/vue/color-picker";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

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

export const ColorFieldLabel = htmlPart("label", "color-field-label", () => colorFieldStyles.label);
export const ColorFieldError = htmlPart("div", "color-field-error", () => colorFieldStyles.error);
export const ColorFieldDescription = htmlPart(
  "span",
  "color-field-description",
  () => colorFieldStyles.description,
);
export const ColorField: typeof ColorFieldRoot & {
  Group: typeof ColorInputGroup.Root;
  Prefix: typeof ColorInputGroup.Prefix;
  Suffix: typeof ColorInputGroup.Suffix;
  Label: typeof ColorFieldLabel;
  Error: typeof ColorFieldError;
  Description: typeof ColorFieldDescription;
  Root: typeof ColorFieldRoot;
  Input: typeof ColorFieldInput;
  ChannelInput: typeof ColorFieldChannelInput;
} = Object.assign(ColorFieldRoot, {
  Group: ColorInputGroup.Root,
  Prefix: ColorInputGroup.Prefix,
  Suffix: ColorInputGroup.Suffix,
  Label: ColorFieldLabel,
  Error: ColorFieldError,
  Description: ColorFieldDescription,
  Root: ColorFieldRoot,
  Input: ColorFieldInput,
  ChannelInput: ColorFieldChannelInput,
});

export {
  createColorPickerController as createColorFieldController,
  type ColorPickerController as ColorFieldController,
} from "@ui-sdk/core/color-picker";

export { parseColor, type Color, type ColorSpace } from "@ui-sdk/core/color";

export { getColorChannels } from "@lenso/primitives/color/core";
