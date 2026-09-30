"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. Native RAC style render state replaces DOM render interception. */
import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
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
          aria-label={name}
          color={color}
          data-custom={name.toLowerCase()}
          style={({ color: c }) => ({ outlineColor: c.toString("css") })}
        />
      ))}
    </div>
  );
}
