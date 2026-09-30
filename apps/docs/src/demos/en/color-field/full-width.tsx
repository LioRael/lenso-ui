"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function FullWidth() {
  return (
    <div {...stylex.props(styles.width400, styles.column)}>
      <ColorField fullWidth defaultValue="#10B981" name="color">
        <ColorField.Label>Brand Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
      </ColorField>
      <ColorField fullWidth defaultValue="#8B5CF6" name="color-with-suffix">
        <ColorField.Label>Theme Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
      </ColorField>
    </div>
  );
}
