"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorField, ColorSwatch, parseColor } from "@lenso/ui";
import type { Color } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function ChannelEditing() {
  const [color, setColor] = useState<Color | null>(parseColor("#7F007F"));
  return (
    <div {...stylex.props(styles.column)}>
      <p {...stylex.props(styles.muted)}>Edit individual HSL channels:</p>
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
          Current: {color ? color.toString("hex") : "(empty)"}
        </span>
      </div>
    </div>
  );
}
