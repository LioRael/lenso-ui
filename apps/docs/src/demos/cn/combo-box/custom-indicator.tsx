// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6, Apache-2.0.
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
