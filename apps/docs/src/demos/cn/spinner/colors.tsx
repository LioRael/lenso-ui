"use client";

import { Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const COLOR_LABELS = {
  accent: "强调",
  current: "当前",
  danger: "危险",
  success: "成功",
  warning: "警告",
};
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 32,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  caption: {
    fontSize: 12,
    lineHeight: "16px",
    color: "var(--lenso-label-secondary)",
    textTransform: "capitalize",
  },
});
export function SpinnerColors() {
  return (
    <div {...stylex.props(styles.row)}>
      {(["current", "accent", "success", "warning", "danger"] as const).map((color) => (
        <div key={color} {...stylex.props(styles.column)}>
          <Spinner color={color} />
          <span {...stylex.props(styles.caption)}>{COLOR_LABELS[color]}</span>
        </div>
      ))}
    </div>
  );
}
export default SpinnerColors;
