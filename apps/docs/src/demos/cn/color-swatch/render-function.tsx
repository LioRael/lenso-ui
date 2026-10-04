// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. Native RAC style render state replaces DOM render interception. */
const CN_SWATCH_LABELS: Record<string, string> = {
  Blue: "蓝色",
  Red: "红色",
  Amber: "琥珀色",
  Green: "绿色",
  Fuchsia: "品红",
};
import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
const colors = [
  ["Blue", "#0485F7"],
  ["Red", "#EF4444"],
  ["Amber", "#F59E0B"],
  ["Green", "#10B981"],
  ["Fuchsia", "#D946EF"],
] as const;
export function RenderFunction() {
  return (
    <div {...stylex.props(styles.row)}>
      {colors.map(([name, color]) => (
        <ColorSwatch
          key={name}
          aria-label={CN_SWATCH_LABELS[name]}
          color={color}
          data-custom={name.toLowerCase()}
          style={({ color: c }) => ({
            outlineColor: c.toString("css"),
          })}
        />
      ))}
    </div>
  );
}
