// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { Button, ColorField, ColorSwatch, parseColor } from "@lenso/ui";
import type { Color } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function Controlled() {
  const [value, setValue] = useState<Color | null>(parseColor("#0485F7"));
  return (
    <div {...stylex.props(styles.column)}>
      <ColorField xstyle={styles.width280} name="color" value={value} onChange={setValue}>
        <ColorField.Label>颜色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Prefix>
            <ColorSwatch color={value ?? undefined} size="xs" />
          </ColorField.Prefix>
          <ColorField.Input />
        </ColorField.Group>
        <ColorField.Description>
          当前值：{value ? value.toString("hex") : "（空）"}
        </ColorField.Description>
      </ColorField>
      <div {...stylex.props(styles.row2)}>
        <Button variant="tertiary" onClick={() => setValue(parseColor("#EF4444"))}>
          设为红色
        </Button>
        <Button variant="tertiary" onClick={() => setValue(parseColor("#10B981"))}>
          设为绿色
        </Button>
        <Button variant="tertiary" onClick={() => setValue(null)}>
          清空
        </Button>
      </div>
    </div>
  );
}
