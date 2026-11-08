"use client";

import { ChevronsExpandVertical } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AnimalPicker } from "./custom-indicator--shared";
import { styles } from "../../en/combo-box/styles.stylex";
export function CustomIndicator() {
  return (
    <AnimalPicker
      indicator={<ChevronsExpandVertical aria-hidden {...stylex.props(styles.icon)} />}
    />
  );
}
