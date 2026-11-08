"use client";
import { ColorField, Surface } from "@lenso/ui";
import { styles } from "../color-picker/source.stylex";
export function OnSurface() {
  return (
    <Surface xstyle={[styles.width320, styles.padded]}>
      <ColorField defaultValue="#3B82F6" name="color">
        <ColorField.Label>Theme Color</ColorField.Label>
        <ColorField.Group variant="secondary">
          <ColorField.Input />
        </ColorField.Group>
        <ColorField.Description>Select your theme color</ColorField.Description>
      </ColorField>
    </Surface>
  );
}
