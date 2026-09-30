"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function Disabled() {
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField isDisabled xstyle={styles.width280} defaultValue="#0485F7" name="color">
        <ColorField.Label>Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
        <ColorField.Description>This color field is disabled</ColorField.Description>
      </ColorField>
      <ColorField isDisabled xstyle={styles.width280} name="color-empty">
        <ColorField.Label>Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input placeholder="#000000" />
        </ColorField.Group>
        <ColorField.Description>This color field is disabled</ColorField.Description>
      </ColorField>
    </div>
  );
}
