"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function Required() {
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField isRequired xstyle={styles.width280} name="color">
        <ColorField.Label>Brand Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input placeholder="#000000" />
        </ColorField.Group>
      </ColorField>
      <ColorField isRequired xstyle={styles.width280} name="theme-color">
        <ColorField.Label>Theme Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input placeholder="#000000" />
        </ColorField.Group>
        <ColorField.Description>Required field</ColorField.Description>
      </ColorField>
    </div>
  );
}
