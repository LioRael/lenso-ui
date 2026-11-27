import ColorFieldDescription from "./color-field-description.svelte";
export { ColorFieldDescription };
import ColorFieldError from "./color-field-error.svelte";
export { ColorFieldError };
import ColorFieldLabel from "./color-field-label.svelte";
export { ColorFieldLabel };
import { ColorInputGroup } from "../color-input-group/index.js";
import ColorFieldRoot from "./color-field-root.svelte";
import ColorFieldInput from "./color-field-input.svelte";
import ColorFieldChannelInput from "./color-field-channel-input.svelte";

export { ColorFieldRoot, ColorFieldInput, ColorFieldChannelInput };
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
