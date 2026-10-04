// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
const COLOR_LABELS: Record<(typeof colors)[number], string> = {
  accent: "强调",
  danger: "危险",
  default: "默认",
  success: "成功",
  warning: "警告",
};
const colors = ["default", "accent", "success", "warning", "danger"] as const;
import { Meter } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: {
    display: "flex",
    width: 256,
    flexDirection: "column",
    gap: 24,
  },
});
export function Colors() {
  return (
    <div {...stylex.props(styles.column)}>
      {(["default", "accent", "success", "warning", "danger"] as const).map((color) => (
        <Meter key={color} color={color} value={50}>
          <Meter.Label>{COLOR_LABELS[color]}</Meter.Label>
          <Meter.Output />
          <Meter.Track>
            <Meter.Fill />
          </Meter.Track>
        </Meter>
      ))}
    </div>
  );
}
export default Colors;
