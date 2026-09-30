"use client";
// HeroUI v3.2.6, Apache-2.0.
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
