"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField, ColorSwatch, parseColor } from "@lenso/ui";
import type { Color } from "@lenso/ui";
import { useState } from "react";
import { styles } from "../color-picker/source.stylex";
export function CustomStyles() {
  const [color, setColor] = useState<Color | null>(parseColor("#6366F1"));
  return (
    <ColorField xstyle={styles.customField} name="accent-color" value={color} onChange={setColor}>
      <ColorField.Label xstyle={styles.label}>Accent color</ColorField.Label>
      <ColorField.Description>Applied to buttons, links, and focus rings.</ColorField.Description>
      <ColorField.Group xstyle={styles.customGroup} variant="secondary">
        <ColorField.Prefix>
          <ColorSwatch xstyle={styles.square} color={color ?? undefined} size="xs" />
        </ColorField.Prefix>
        <ColorField.Input xstyle={styles.customInput} />
      </ColorField.Group>
    </ColorField>
  );
}
