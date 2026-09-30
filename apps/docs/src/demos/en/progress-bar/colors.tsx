"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ProgressBar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: { display: "flex", width: 256, flexDirection: "column", gap: 24 },
});
export function Colors() {
  return (
    <div {...stylex.props(styles.column)}>
      {(["default", "accent", "success", "warning", "danger"] as const).map((color) => (
        <ProgressBar key={color} color={color} value={50}>
          <ProgressBar.Label>
            {color[0]?.toUpperCase()}
            {color.slice(1)}
          </ProgressBar.Label>
          <ProgressBar.Output />
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      ))}
    </div>
  );
}
export default Colors;
