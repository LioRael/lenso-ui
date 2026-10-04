// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField, Surface } from "@lenso/ui";
import { styles } from "../../en/color-picker/source.stylex";
export function OnSurface() {
  return (
    <Surface xstyle={[styles.width320, styles.padded]}>
      <ColorField defaultValue="#3B82F6" name="color">
        <ColorField.Label>主题色</ColorField.Label>
        <ColorField.Group variant="secondary">
          <ColorField.Input />
        </ColorField.Group>
        <ColorField.Description>选择你的主题色</ColorField.Description>
      </ColorField>
    </Surface>
  );
}
