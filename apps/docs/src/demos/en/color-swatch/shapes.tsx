"use client";
import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function ColorSwatchShapes() {
  return (
    <div {...stylex.props(styles.row)}>
      <ColorSwatch color="#0485F7" shape="circle" />
      <ColorSwatch color="#0485F7" shape="square" />
    </div>
  );
}
