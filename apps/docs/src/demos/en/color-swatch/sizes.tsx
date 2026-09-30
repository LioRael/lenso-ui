"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function ColorSwatchSizes() {
  return (
    <div {...stylex.props(styles.row)}>
      <ColorSwatch color="#0485F7" size="xs" />
      <ColorSwatch color="#EF4444" size="sm" />
      <ColorSwatch color="#F59E0B" size="md" />
      <ColorSwatch color="#10B981" size="lg" />
      <ColorSwatch color="#D946EF" size="xl" />
    </div>
  );
}
