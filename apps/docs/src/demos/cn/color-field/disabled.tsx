"use client";

import { ColorField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function Disabled() {
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField isDisabled xstyle={styles.width280} defaultValue="#0485F7" name="color">
        <ColorField.Label>颜色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
        <ColorField.Description>该颜色字段已禁用</ColorField.Description>
      </ColorField>
      <ColorField isDisabled xstyle={styles.width280} name="color-empty">
        <ColorField.Label>颜色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input placeholder="#000000" />
        </ColorField.Group>
        <ColorField.Description>该颜色字段已禁用</ColorField.Description>
      </ColorField>
    </div>
  );
}
