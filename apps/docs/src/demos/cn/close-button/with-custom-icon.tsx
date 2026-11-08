"use client";

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
