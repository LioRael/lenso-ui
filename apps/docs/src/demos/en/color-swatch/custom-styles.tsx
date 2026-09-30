"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
const colors = ["#0485F7", "#EF4444", "#F59E0B", "#10B981", "#D946EF"];
export function ColorSwatchCustomStyles() {
  return (
    <div {...stylex.props(styles.column8)}>
      <div {...stylex.props(styles.column2)}>
        <span {...stylex.props(styles.muted)}>Glow Effect</span>
        <div {...stylex.props(styles.row4)}>
          {colors.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              size="xl"
              style={() => ({ boxShadow: `0 0 20px 2px ${color}` })}
            />
          ))}
        </div>
      </div>
      <div {...stylex.props(styles.column2)}>
        <span {...stylex.props(styles.muted)}>Gradient</span>
        <div {...stylex.props(styles.row4)}>
          {colors.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              size="xl"
              style={({ color: c }) => ({
                background: `linear-gradient(135deg, ${c.toString("css")}, white)`,
              })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
