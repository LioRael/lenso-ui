"use client";

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
