"use client";
import * as stylex from "@stylexjs/stylex";
import { AnimalPicker, animals } from "./shared";
import { styles } from "./styles.stylex";
export function FullWidth() {
  return (
    <div {...stylex.props(styles.wide)}>
      <AnimalPicker fullWidth items={animals.slice(0, 3)} />
    </div>
  );
}
