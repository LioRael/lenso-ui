"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function WithDescription() {
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField xstyle={styles.width280} defaultValue="#3B82F6" name="color">
        <ColorField.Label>Primary Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
        <ColorField.Description>Enter your brand's primary color</ColorField.Description>
      </ColorField>
      <ColorField xstyle={styles.width280} defaultValue="#F59E0B" name="accent-color">
        <ColorField.Label>Accent Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Input />
        </ColorField.Group>
        <ColorField.Description>Used for highlights and CTAs</ColorField.Description>
      </ColorField>
    </div>
  );
}
