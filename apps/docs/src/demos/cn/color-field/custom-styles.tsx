// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField, ColorSwatch, parseColor } from "@lenso/ui";
import type { Color } from "@lenso/ui";
import { useState } from "react";
import { styles } from "../../en/color-picker/source.stylex";
export function CustomStyles() {
  const [color, setColor] = useState<Color | null>(parseColor("#6366F1"));
  return (
    <ColorField xstyle={styles.customField} name="accent-color" value={color} onChange={setColor}>
      <ColorField.Label xstyle={styles.label}>强调色</ColorField.Label>
      <ColorField.Description>应用于按钮、链接和焦点环。</ColorField.Description>
      <ColorField.Group xstyle={styles.customGroup} variant="secondary">
        <ColorField.Prefix>
          <ColorSwatch xstyle={styles.square} color={color ?? undefined} size="xs" />
        </ColorField.Prefix>
        <ColorField.Input xstyle={styles.customInput} />
      </ColorField.Group>
    </ColorField>
  );
}
