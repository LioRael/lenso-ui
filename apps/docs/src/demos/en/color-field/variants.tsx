"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function Variants() {
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField xstyle={styles.width280} defaultValue="#0485F7" name="primary-color">
        <ColorField.Label>Primary variant</ColorField.Label>
        <ColorField.Group variant="primary">
          <ColorField.Input />
        </ColorField.Group>
      </ColorField>
      <ColorField xstyle={styles.width280} defaultValue="#F43F5E" name="secondary-color">
        <ColorField.Label>Secondary variant</ColorField.Label>
        <ColorField.Group variant="secondary">
          <ColorField.Input />
        </ColorField.Group>
      </ColorField>
    </div>
  );
}
