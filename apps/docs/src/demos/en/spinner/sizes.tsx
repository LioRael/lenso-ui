"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: { display: "flex", alignItems: "center", gap: 32 },
  column: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8 },
  caption: { fontSize: 12, lineHeight: "16px", color: "var(--muted)" },
});
export function SpinnerSizes() {
  return (
    <div {...stylex.props(styles.row)}>
      {(
        [
          ["sm", "Small"],
          ["md", "Medium"],
          ["lg", "Large"],
          ["xl", "Extra Large"],
        ] as const
      ).map(([size, label]) => (
        <div key={size} {...stylex.props(styles.column)}>
          <Spinner size={size} />
          <span {...stylex.props(styles.caption)}>{label}</span>
        </div>
      ))}
    </div>
  );
}
export default SpinnerSizes;
