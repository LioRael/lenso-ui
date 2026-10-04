// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { CircleXmark, Xmark } from "@gravity-ui/icons";
import { CloseButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/close-button/source.stylex";
export function WithCustomIcon() {
  return (
    <div {...stylex.props(styles.row)}>
      <div {...stylex.props(styles.column)}>
        <CloseButton>
          <CircleXmark />
        </CloseButton>
        <span {...stylex.props(styles.caption)}>自定义图标</span>
      </div>
      <div {...stylex.props(styles.column)}>
        <CloseButton>
          <Xmark />
        </CloseButton>
        <span {...stylex.props(styles.caption)}>备选图标</span>
      </div>
    </div>
  );
}
