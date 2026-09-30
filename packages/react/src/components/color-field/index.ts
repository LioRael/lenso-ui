/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
export { parseColor, getColorChannels } from "react-stately/Color";
export type { ColorChannel, ColorSpace } from "react-stately/Color";
export {
  ColorFieldRoot,
  ColorFieldLabel,
  ColorFieldDescription,
  ColorFieldError,
} from "./color-field.js";
export type {
  ColorFieldRootProps,
  ColorFieldRootProps as ColorFieldProps,
  ColorValue,
  ColorValue as Color,
} from "./color-field.js";
import {
  ColorFieldRoot,
  ColorFieldLabel,
  ColorFieldDescription,
  ColorFieldError,
} from "./color-field.js";
import { ColorInputGroup } from "../color-input-group/index.js";
export const ColorField = Object.assign(ColorFieldRoot, {
  Root: ColorFieldRoot,
  Label: ColorFieldLabel,
  Description: ColorFieldDescription,
  Error: ColorFieldError,
  Group: ColorInputGroup.Root,
  Input: ColorInputGroup.Input,
  Prefix: ColorInputGroup.Prefix,
  Suffix: ColorInputGroup.Suffix,
});
