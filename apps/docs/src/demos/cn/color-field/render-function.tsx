// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. Native RAC render state replaces DOM render interception. */
import { ColorField, ColorSwatch, parseColor } from "@lenso/ui";
import type { Color } from "@lenso/ui";
import { useState } from "react";
import { styles } from "../../en/color-picker/source.stylex";
export function RenderFunction() {
  const [color, setColor] = useState<Color | null>(parseColor("#0485F7"));
  return (
    <ColorField
      xstyle={styles.width280}
      name="color"
      data-custom="foo"
      value={color}
      onChange={setColor}
    >
      {({ isInvalid }) => (
        <>
          <ColorField.Label>颜色</ColorField.Label>
          <ColorField.Group data-custom="foo" data-invalid={isInvalid || undefined}>
            <ColorField.Prefix>
              <ColorSwatch color={color ?? undefined} size="xs" />
            </ColorField.Prefix>
            <ColorField.Input />
          </ColorField.Group>
        </>
      )}
    </ColorField>
  );
}
