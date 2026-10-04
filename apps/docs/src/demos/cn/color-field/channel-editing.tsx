// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField, ColorSwatch, parseColor } from "@lenso/ui";
import type { Color } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function ChannelEditing() {
  const [color, setColor] = useState<Color | null>(parseColor("#7F007F"));
  return (
    <div {...stylex.props(styles.column)}>
      <p {...stylex.props(styles.muted)}>分别编辑 HSL 通道：</p>
      <div {...stylex.props(styles.controls)}>
        {(["hue", "saturation", "lightness"] as const).map((channel) => (
          <ColorField
            key={channel}
            channel={channel}
            xstyle={styles.width100}
            colorSpace="hsl"
            name={channel}
            value={color}
            onChange={setColor}
          >
            <ColorField.Label xstyle={styles.capitalize}>{channel}</ColorField.Label>
            <ColorField.Group>
              <ColorField.Input />
              {channel !== "hue" && (
                <ColorField.Suffix>
                  <span {...stylex.props(styles.muted)}>%</span>
                </ColorField.Suffix>
              )}
            </ColorField.Group>
          </ColorField>
        ))}
      </div>
      <div {...stylex.props(styles.row2)}>
        <ColorSwatch color={color ?? undefined} size="md" />
        <span {...stylex.props(styles.small)}>
          当前：{color ? color.toString("hex") : "（空）"}
        </span>
      </div>
    </div>
  );
}
