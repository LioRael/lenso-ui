"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { Button, ColorField, ColorSwatch, parseColor } from "@lenso/ui";
import type { Color } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function Controlled() {
  const [value, setValue] = useState<Color | null>(parseColor("#0485F7"));
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField xstyle={styles.width280} name="color" value={value} onChange={setValue}>
        <ColorField.Label>Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Prefix>
            <ColorSwatch color={value ?? undefined} size="xs" />
          </ColorField.Prefix>
          <ColorField.Input />
        </ColorField.Group>
        <ColorField.Description>
          Current value: {value ? value.toString("hex") : "(empty)"}
        </ColorField.Description>
      </ColorField>
      <div {...stylex.props(styles.row2)}>
        <Button variant="tertiary" onClick={() => setValue(parseColor("#EF4444"))}>
          Set Red
        </Button>
        <Button variant="tertiary" onClick={() => setValue(parseColor("#10B981"))}>
          Set Green
        </Button>
        <Button variant="tertiary" onClick={() => setValue(null)}>
          Clear
        </Button>
      </div>
    </div>
  );
}
