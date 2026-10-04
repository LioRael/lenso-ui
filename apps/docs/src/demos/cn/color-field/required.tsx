// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function Required() {
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField isRequired xstyle={styles.width280} name="color">
        <ColorField.Label>品牌色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input placeholder="#000000" />
        </ColorField.Group>
      </ColorField>
      <ColorField isRequired xstyle={styles.width280} name="theme-color">
        <ColorField.Label>主题色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input placeholder="#000000" />
        </ColorField.Group>
        <ColorField.Description>必填项</ColorField.Description>
      </ColorField>
    </div>
  );
}
