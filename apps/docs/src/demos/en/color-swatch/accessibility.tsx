"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function ColorSwatchAccessibility() {
  return (
    <div {...stylex.props(styles.row)}>
      <ColorSwatch aria-label="Primary brand color" color="#0485F7" colorName="Ocean Blue" />
      <ColorSwatch aria-label="Error state color" color="#EF4444" colorName="Coral Red" />
      <ColorSwatch aria-label="Warning color" color="#F59E0B" colorName="Sunset Orange" />
    </div>
  );
}
