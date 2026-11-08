"use client";

import { ColorField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function FullWidth() {
  return (
    <div {...stylex.props(styles.width400, styles.column)}>
      <ColorField fullWidth defaultValue="#10B981" name="color">
        <ColorField.Label>品牌色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
      </ColorField>
      <ColorField fullWidth defaultValue="#8B5CF6" name="color-with-suffix">
        <ColorField.Label>主题色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
      </ColorField>
    </div>
  );
}
