// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { ColorField, ColorSwatch, parseColor } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    width: 280,
    maxWidth: "100%",
  },
});
export function Basic() {
  const [color, setColor] = useState<ReturnType<typeof parseColor> | null>(() =>
    parseColor("#0485F7"),
  );
  return (
    <ColorField xstyle={styles.field} name="color" value={color} onChange={setColor}>
      <ColorField.Label>颜色</ColorField.Label>
      <ColorField.Group>
        <ColorField.Prefix>
          <ColorSwatch
            {...(color
              ? {
                  color,
                }
              : {})}
            size="xs"
          />
        </ColorField.Prefix>
        <ColorField.Input />
      </ColorField.Group>
    </ColorField>
  );
}
