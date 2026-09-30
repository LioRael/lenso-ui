"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { ColorArea, ColorThumb } from "react-aria-components/ColorArea";
import type { ComponentPropsWithRef } from "react";
import { colorAreaStyles as styles } from "@lenso/tokens/color-area";
import type { StyleXProps } from "../../utils/styled.js";
import { racPart } from "../date-input-group/rac-part.js";
const Root = racPart(ColorArea, "color-area", (state: { isDisabled: boolean }) => [
  styles.root,
  state.isDisabled && styles.disabled,
]);
export type ColorAreaRootProps = StyleXProps<ComponentPropsWithRef<typeof ColorArea>> & {
  showDots?: boolean;
};
export function ColorAreaRoot({ showDots, xstyle, ...props }: ColorAreaRootProps) {
  return <Root {...props} xstyle={[showDots && styles.dots, xstyle]} />;
}
export const ColorAreaThumb = racPart(
  ColorThumb,
  "color-area-thumb",
  (state: { isDragging: boolean; isFocusVisible: boolean; isDisabled: boolean }) => [
    styles.thumb,
    state.isDragging && styles.dragging,
    state.isFocusVisible && styles.focused,
    state.isDisabled && styles.disabled,
  ],
);
