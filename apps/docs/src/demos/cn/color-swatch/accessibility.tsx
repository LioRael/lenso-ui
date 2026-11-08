"use client";

import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function ColorSwatchAccessibility() {
  return (
    <div {...stylex.props(styles.row)}>
      <ColorSwatch aria-label="主品牌色" color="#0485F7" colorName="Ocean Blue" />
      <ColorSwatch aria-label="错误状态色" color="#EF4444" colorName="Coral Red" />
      <ColorSwatch aria-label="警告色" color="#F59E0B" colorName="Sunset Orange" />
    </div>
  );
}
