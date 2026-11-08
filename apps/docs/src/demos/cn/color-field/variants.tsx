"use client";

import { ColorField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function Variants() {
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField xstyle={styles.width280} defaultValue="#0485F7" name="primary-color">
        <ColorField.Label>主要变体</ColorField.Label>
        <ColorField.Group variant="primary">
          <ColorField.Input />
        </ColorField.Group>
      </ColorField>
      <ColorField xstyle={styles.width280} defaultValue="#F43F5E" name="secondary-color">
        <ColorField.Label>次要变体</ColorField.Label>
        <ColorField.Group variant="secondary">
          <ColorField.Input />
        </ColorField.Group>
      </ColorField>
    </div>
  );
}
