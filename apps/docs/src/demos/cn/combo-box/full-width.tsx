"use client";

import * as stylex from "@stylexjs/stylex";
import { AnimalPicker, animals } from "./full-width--shared";
import { styles } from "../../en/combo-box/styles.stylex";
export function FullWidth() {
  return (
    <div {...stylex.props(styles.wide)}>
      <AnimalPicker
        fullWidth
        items={animals.slice(0, 3).map((value) => ({ value, label: value.name }))}
      />
    </div>
  );
}
