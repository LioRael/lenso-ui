// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
import { AnimalPicker, animals } from "./full-width--shared";
import { styles } from "../../en/combo-box/styles.stylex";
export function FullWidth() {
  return (
    <div {...stylex.props(styles.wide)}>
      <AnimalPicker fullWidth items={animals.slice(0, 3)} />
    </div>
  );
}
