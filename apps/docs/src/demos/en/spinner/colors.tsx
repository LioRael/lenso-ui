"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 32 },
  column: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  caption: { fontSize: 12, lineHeight: "16px", color: "var(--muted)", textTransform: "capitalize" },
});
export function SpinnerColors() {
  return (
    <div {...stylex.props(styles.row)}>
      {(["current", "accent", "success", "warning", "danger"] as const).map((color) => (
        <div key={color} {...stylex.props(styles.column)}>
          <Spinner color={color} />
          <span {...stylex.props(styles.caption)}>{color}</span>
        </div>
      ))}
    </div>
  );
}
export default SpinnerColors;
