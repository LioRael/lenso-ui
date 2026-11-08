"use client";
import { ChevronsExpandVertical } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AnimalPicker } from "./shared";
import { styles } from "./styles.stylex";
export function CustomIndicator() {
  return (
    <AnimalPicker
      indicator={<ChevronsExpandVertical aria-hidden {...stylex.props(styles.icon)} />}
    />
  );
}
