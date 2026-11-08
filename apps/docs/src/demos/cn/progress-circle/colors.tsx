"use client";

const COLOR_LABELS: Record<(typeof colors)[number], string> = {
  accent: "强调",
  danger: "危险",
  default: "默认",
  success: "成功",
  warning: "警告",
};
const colors = ["default", "accent", "success", "warning", "danger"] as const;
import { ProgressCircle } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "center",
    gap: 24,
  },
});
export function Colors() {
  return (
    <div {...stylex.props(styles.row)}>
      {(["default", "accent", "success", "warning", "danger"] as const).map((color) => (
        <ProgressCircle key={color} aria-label={COLOR_LABELS[color]} color={color} value={60}>
          <ProgressCircle.Track>
            <ProgressCircle.TrackCircle />
            <ProgressCircle.FillCircle />
          </ProgressCircle.Track>
        </ProgressCircle>
      ))}
    </div>
  );
}
export default Colors;
