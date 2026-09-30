/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX. */
import type { ComponentProps } from "react";
import { ColorAreaRoot, ColorAreaThumb } from "./color-area.js";
export type ColorAreaThumbProps = ComponentProps<typeof ColorAreaThumb>;
export { ColorAreaRoot, ColorAreaThumb };
export type { ColorAreaRootProps, ColorAreaRootProps as ColorAreaProps } from "./color-area.js";
export const ColorArea = Object.assign(ColorAreaRoot, {
  Root: ColorAreaRoot,
  Thumb: ColorAreaThumb,
});
