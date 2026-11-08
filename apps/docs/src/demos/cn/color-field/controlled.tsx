"use client";

import { GlassButton, ColorField, ColorSwatch, parseColor } from "@lenso/ui";
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
        <GlassButton variant="default" onClick={() => setValue(parseColor("#EF4444"))}>
          设为红色
        </GlassButton>
        <GlassButton variant="default" onClick={() => setValue(parseColor("#10B981"))}>
          设为绿色
        </GlassButton>
        <GlassButton variant="default" onClick={() => setValue(null)}>
          清空
        </GlassButton>
      </div>
    </div>
  );
}
