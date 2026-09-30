/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
import type { ComponentProps } from "react";
import {
  ColorInputGroupRoot,
  ColorInputGroupInput,
  ColorInputGroupPrefix,
  ColorInputGroupSuffix,
} from "./color-input-group.js";
export { ColorInputGroupRoot, ColorInputGroupInput, ColorInputGroupPrefix, ColorInputGroupSuffix };
export type {
  ColorInputGroupRootProps,
  ColorInputGroupRootProps as ColorInputGroupProps,
} from "./color-input-group.js";
export type ColorInputGroupInputProps = ComponentProps<typeof ColorInputGroupInput>;
export type ColorInputGroupPrefixProps = ComponentProps<typeof ColorInputGroupPrefix>;
export type ColorInputGroupSuffixProps = ComponentProps<typeof ColorInputGroupSuffix>;
export const ColorInputGroup = Object.assign(ColorInputGroupRoot, {
  Root: ColorInputGroupRoot,
  Input: ColorInputGroupInput,
  Prefix: ColorInputGroupPrefix,
  Suffix: ColorInputGroupSuffix,
});
