"use client";

import { ColorField, ColorSwatch, parseColor } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ field: { width: 280, maxWidth: "100%" } });
export function Basic() {
  const [color, setColor] = useState<ReturnType<typeof parseColor> | null>(() =>
    parseColor("#0485F7"),
  );
  return (
    <ColorField xstyle={styles.field} name="color" value={color} onChange={setColor}>
      <ColorField.Label>Color</ColorField.Label>
      <ColorField.Group>
        <ColorField.Prefix>
          <ColorSwatch {...(color ? { color } : {})} size="xs" />
        </ColorField.Prefix>
        <ColorField.Input />
      </ColorField.Group>
    </ColorField>
  );
}
