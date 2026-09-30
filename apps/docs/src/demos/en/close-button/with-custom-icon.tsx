"use client";
// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { CircleXmark, Xmark } from "@gravity-ui/icons";
import { CloseButton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function WithCustomIcon() {
  return (
    <div {...stylex.props(styles.row)}>
      <div {...stylex.props(styles.column)}>
        <CloseButton>
          <CircleXmark />
        </CloseButton>
        <span {...stylex.props(styles.caption)}>Custom Icon</span>
      </div>
      <div {...stylex.props(styles.column)}>
        <CloseButton>
          <Xmark />
        </CloseButton>
        <span {...stylex.props(styles.caption)}>Alternative Icon</span>
      </div>
    </div>
  );
}
