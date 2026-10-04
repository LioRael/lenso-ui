// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function WithDescription() {
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField xstyle={styles.width280} defaultValue="#3B82F6" name="color">
        <ColorField.Label>主色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
        <ColorField.Description>输入品牌主色</ColorField.Description>
      </ColorField>
      <ColorField xstyle={styles.width280} defaultValue="#F59E0B" name="accent-color">
        <ColorField.Label>强调色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
        <ColorField.Description>用于高亮与行动按钮</ColorField.Description>
      </ColorField>
    </div>
  );
}
